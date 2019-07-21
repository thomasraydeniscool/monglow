import ow from 'ow';
import { Collection, MongoClient, ObjectId, FindOneOptions } from 'mongodb';

import { cast, timestamp } from './utils';

class Model {
  private queue: any[];
  private collectionPromise: Promise<Collection> | null;
  private modelName: string;

  constructor(name: string) {
    ow(name, ow.string);
    this.collectionPromise = null;
    this.modelName = name;
    this.queue = [];
  }

  get name() {
    return this.modelName;
  }

  public init(instance: Promise<MongoClient>) {
    ow(instance, ow.promise);
    this.collectionPromise = instance
      .then(client => client.db().collection(this.name))
      .then(collection => {
        this.queue.forEach(({ action, r, j }) => {
          action(collection)
            .then(r)
            .catch(j);
        });
        return collection;
      });
    return this;
  }

  public collection(
    action: (collection: Collection) => Promise<any>
  ): Promise<any> {
    if (this.collectionPromise) {
      return this.collectionPromise.then(action);
    } else {
      return new Promise((r, j) => {
        this.queue.push({ action, r, j });
      });
    }
  }

  public find(query = {}, findOptions?: FindOneOptions) {
    ow(query, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.collection(collection => {
      const cursor = collection.find(query, findOptions);
      return cursor.toArray();
    });
  }

  public findOne(filter = {}, findOptions?: FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.collection(collection =>
      collection.findOne(cast(filter), findOptions)
    );
  }

  public findById(id: string | ObjectId, findOptions?: FindOneOptions) {
    ow(id, ow.any(ow.string, ow.object.instanceOf(ObjectId)));
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.findOne({ _id: id }, findOptions);
  }

  public updateOne(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(set) };
    return this.collection(collection => {
      return collection
        .updateOne(cast(filter), update)
        .then(response => response.result);
    });
  }

  public updateMany(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(set) };
    return this.collection(collection =>
      collection
        .updateMany(cast(filter), update)
        .then(response => response.result)
    );
  }

  public insertOne(document: any) {
    ow(document, ow.object.plain);
    const insert = cast(timestamp(document, true));
    return this.collection(collection =>
      collection.insertOne(insert).then(response => response.result)
    );
  }

  public insertMany(documents: any[]) {
    ow(documents, ow.array);
    const insert = documents.map(document => cast(timestamp(document, true)));
    return this.collection(collection =>
      collection.insertMany(insert).then(response => response.result)
    );
  }
}

export default Model;
