import ow from 'ow';
import { Collection, MongoClient, ObjectId, FindOneOptions } from 'mongodb';

import { cast, timestamp, MonglowCastSchema } from './utils';

export interface MonglowModelOptions {
  cast?: MonglowCastSchema;
}

class Model {
  private queue: any[];
  private collectionPromise: Promise<Collection> | null;
  private modelName: string;

  private cast: (value: any) => any;

  constructor(name: string, options: MonglowModelOptions = {}) {
    ow(name, ow.string);
    ow(options, ow.object.plain);
    this.collectionPromise = null;
    this.modelName = name;
    this.queue = [];
    if (options.cast) {
      this.cast = (value: any) => cast(value, { schema: options.cast });
    } else {
      this.cast = cast;
    }
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
    ow(action, ow.function);
    if (this.collectionPromise) {
      return this.collectionPromise.then(action);
    } else {
      return new Promise((r, j) => {
        this.queue.push({ action, r, j });
      });
    }
  }

  public find(filter = {}, findOptions?: FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.collection(c => {
      const cursor = c.find(this.cast(filter), findOptions);
      return cursor.toArray();
    });
  }

  public findOne(filter = {}, findOptions?: FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.collection(c => c.findOne(this.cast(filter), findOptions));
  }

  public findById(id: string | ObjectId, findOptions?: FindOneOptions) {
    ow(id, ow.any(ow.string, ow.object.instanceOf(ObjectId)));
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.findOne({ _id: id }, findOptions);
  }

  public updateOne(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(this.cast(set)) };
    return this.collection(c => {
      return c
        .updateOne(this.cast(filter), update)
        .then(response => response.result);
    });
  }

  public updateMany(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(this.cast(set)) };
    return this.collection(c =>
      c.updateMany(this.cast(filter), update).then(response => response.result)
    );
  }

  public insertOne(document: any) {
    ow(document, ow.object.plain);
    const insert = timestamp(this.cast(document), { created: true });
    return this.collection(c =>
      c.insertOne(insert).then(response => response.result)
    );
  }

  public insertMany(documents: any[]) {
    ow(documents, ow.array);
    const insert = timestamp(this.cast(documents), { created: true });
    return this.collection(c =>
      c.insertMany(insert).then(response => response.result)
    );
  }

  public deleteOne(filter: any) {
    ow(filter, ow.object.plain);
    return this.collection(c =>
      c.deleteOne(this.cast(filter)).then(response => response.result)
    );
  }

  public deleteMany(filter: any) {
    ow(filter, ow.object.plain);
    return this.collection(c =>
      c.deleteMany(this.cast(filter)).then(response => response.result)
    );
  }
}

export default Model;
