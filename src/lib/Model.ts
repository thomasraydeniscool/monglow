import ow from 'ow';
import { Collection, Db, MongoClient, ObjectId, FindOneOptions } from 'mongodb';

import { cast, timestamp } from './utils';

class Model {
  private _collection!: Collection;
  private _name: string;

  constructor(name: string) {
    ow(name, ow.string);
    this._name = name;
  }

  get collection() {
    return this._collection;
  }

  get name() {
    return this._name;
  }

  public init(instance: Promise<MongoClient>) {
    ow(instance, ow.promise);
    instance.then(client => {
      this.setDatabase(client.db());
    });
    return this;
  }

  public setDatabase(db: Db) {
    ow(db, ow.object.instanceOf(Db));
    this._collection = db.collection(this._name);
    return this;
  }

  public find(query = {}, findOptions?: FindOneOptions) {
    ow(query, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    const cursor = this.collection.find(query, findOptions);
    return cursor.toArray();
  }

  public findOne(filter = {}, findOptions?: FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.collection.findOne(cast(filter), findOptions);
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
    return this.collection
      .updateOne(cast(filter), update)
      .then(response => response.result);
  }

  public updateMany(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(set) };
    return this.collection
      .updateMany(cast(filter), update)
      .then(response => response.result);
  }

  public insertOne(document: any) {
    ow(document, ow.object.plain);
    const insert = cast(timestamp(document, true));
    return this.collection.insertOne(insert).then(response => response.result);
  }

  public insertMany(documents: any[]) {
    ow(documents, ow.array);
    const insert = documents.map(document => cast(timestamp(document, true)));
    return this.collection.insertMany(insert).then(response => response.result);
  }
}

export default Model;
