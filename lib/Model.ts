import ow from 'ow';
import { Collection, Db, MongoClient } from 'mongodb';
import QueryChain from './QueryChain';

class Model {
  public static create(name: string, db: Db) {
    ow(name, ow.string);
    ow(db, ow.object.instanceOf(Db));
    return new Model(name).setDatabase(db);
  }

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

  public find(where = {}) {
    ow(where, ow.object.plain);
    return new QueryChain(this.collection.find(where).toArray());
  }

  public findOne(where = {}) {
    ow(where, ow.object.plain);
    return new QueryChain(this.collection.findOne(where));
  }

  public updateOne(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: { ...set, updatedAt: Date.now() } };
    return this.collection.updateOne(filter, update);
  }

  public insertOne(document: any) {
    ow(document, ow.object.plain);
    const insert = {
      ...document,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return this.collection.insertOne(insert);
  }
}

export default Model;
