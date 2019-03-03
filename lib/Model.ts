import ow from 'ow';
import { Collection, Db } from 'mongodb';
import QueryChain from './QueryChain';

class Model {
  public static create(name: string, db: Db) {
    ow(name, ow.string);
    ow(db, ow.object.instanceOf(Db));
    return new Model(name).attach(db);
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

  public attach(db: Db) {
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
}

export default Model;
