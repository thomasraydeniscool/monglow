import ow from 'ow';
import { Collection, Db } from 'mongodb';
import QueryChain from './QueryChain';

class Model {

  public static create(name: string, db: Db) {
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
    this._collection = db.collection(this._name);
    return this;
  }

  public find(where = {}) {
    const queue = [
      this.collection.find(where).toArray()
    ];
    return new QueryChain(queue);
  }

  public findOne(where = {}) {
    const queue = [
      this.collection.findOne(where)
    ];
    return new QueryChain(queue);
  }
}

export default Model;