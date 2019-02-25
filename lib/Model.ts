import ow from 'ow';
import { Collection, Db } from 'mongodb';
import { QueryChain } from './QueryChain';

export class Model {
  public collection: Collection;
  
  constructor(name: string, db: Db) {
    ow(name, ow.string);
    this.collection = db.collection(name);
  }

  public async find(where = {}) {
    const queue = [
      this.collection.find(where)
    ];
    return new QueryChain(queue);
  }

  public async findOne(where = {}) {
    const queue = [
      this.collection.findOne(where)
    ];
    return new QueryChain(queue);
  }
}