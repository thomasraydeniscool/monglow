import ow from 'ow';
import {
  Collection,
  Db,
  MongoClient,
  ObjectId,
  FindOneOptions,
  Cursor
} from 'mongodb';

import MonglowResponse from './Response';
import { ISODate, cast } from './utils';
import MonglowDocument from './Document';

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

  public find(
    query: any,
    findOptions: FindOneOptions,
    options: { rawCursor: true }
  ): Cursor<any>;
  public find(
    query: any,
    findOptions: FindOneOptions,
    options: { rawCursor: false }
  ): Promise<MonglowResponse>;
  public find(
    query?: any,
    findOptions?: FindOneOptions,
    options?: { rawCursor?: boolean }
  ): Promise<MonglowResponse>;
  public find(
    query = {},
    findOptions: FindOneOptions = {},
    options: { rawCursor?: boolean } = {}
  ) {
    ow(query, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    ow(options, ow.any(ow.object.plain, ow.undefined));
    const cursor = this.collection.find(query, findOptions);
    if (options.rawCursor) {
      return cursor;
    }
    return cursor.toArray().then(data => new MonglowResponse(data));
  }

  public findOne(filter = {}, options?: FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.undefined));
    const task = this.collection.findOne(cast(filter), options);
    return task.then(data => new MonglowDocument(data));
  }

  public findById(id: string | ObjectId, options?: FindOneOptions) {
    ow(id, ow.any(ow.string, ow.object.instanceOf(ObjectId)));
    ow(options, ow.any(ow.object.plain, ow.undefined));
    return this.findOne({ _id: id }, options);
  }

  public updateOne(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: { ...set, updatedAt: ISODate() } };
    return this.collection
      .updateOne(cast(filter), update)
      .then(response => response.result);
  }

  public updateMany(filter: any, set: any) {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: { ...set, updatedAt: ISODate() } };
    return this.collection
      .updateMany(cast(filter), update)
      .then(response => response.result);
  }

  public insertOne(document: any) {
    ow(document, ow.object.plain);
    const insert = cast({
      ...document,
      createdAt: ISODate(),
      updatedAt: ISODate()
    });
    return this.collection.insertOne(insert).then(response => response.result);
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
    return this.collection.insertMany(insert).then(response => response.result);
  }
}

export default Model;
