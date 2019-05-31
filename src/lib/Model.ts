import ow from 'ow';
import { Collection, Db, MongoClient, ObjectId, FindOneOptions } from 'mongodb';

import MonglowResponse from './Response';
import { ISODate, cast } from './utils';

export interface IMonglowQueryOptions {
  rawCursor?: boolean;
  options?: FindOneOptions;
}

export const isMonglowQueryOptions = (
  options: IMonglowQueryOptions | FindOneOptions
): options is IMonglowQueryOptions => {
  return (
    (options as IMonglowQueryOptions).rawCursor !== undefined ||
    (options as IMonglowQueryOptions).options !== undefined
  );
};

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

  public find(filter = {}, options?: IMonglowQueryOptions | FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.undefined));
    if (options && isMonglowQueryOptions(options)) {
      const { rawCursor = false, options: opt } = options;
      if (rawCursor) {
        return MonglowResponse.fromCursor(
          this.collection.find(cast(filter), opt),
          { cursor: true }
        );
      } else {
        return MonglowResponse.fromCursor(
          this.collection.find(cast(filter), opt)
        );
      }
    } else {
      return MonglowResponse.fromCursor(
        this.collection.find(cast(filter), options)
      );
    }
  }

  public findOne(filter = {}, options?: FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.undefined));
    return MonglowResponse.fromPromise(
      this.collection.findOne(cast(filter), options)
    );
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
