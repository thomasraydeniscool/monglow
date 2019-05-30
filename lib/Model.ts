import ow from 'ow';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';

import MonglowResponse from './Response';
import { ISODate, cast } from './util';

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

  public find(filter = {}) {
    ow(filter, ow.object.plain);
    return MonglowResponse.create(
      this.collection.find(cast(filter)).toArray(),
      true
    );
  }

  public findOne(filter = {}) {
    ow(filter, ow.object.plain);
    return MonglowResponse.create(this.collection.findOne(cast(filter)));
  }

  public findById(id: string | ObjectId) {
    ow(id, ow.any(ow.string, ow.object.instanceOf(ObjectId)));
    return this.findOne({ _id: id });
  }

  public updateOne(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: { ...set, updatedAt: ISODate() } };
    return this.collection.updateOne(cast(filter), update);
  }

  public updateMany(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: { ...set, updatedAt: ISODate() } };
    return this.collection.updateMany(cast(filter), update);
  }

  public insertOne(document: any) {
    ow(document, ow.object.plain);
    const insert = cast({
      ...document,
      createdAt: ISODate(),
      updatedAt: ISODate()
    });
    return this.collection.insertOne(insert);
  }

  public insertMany(documents: any[]) {
    ow(documents, ow.array);
    const insert = documents.map(document => {
      return cast({
        ...document,
        createdAt: ISODate(),
        updatedAt: ISODate()
      });
    });
    return this.collection.insertMany(insert);
  }
}

export default Model;
