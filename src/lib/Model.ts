import ow from 'ow';
import { Collection, MongoClient, ObjectId, FindOneOptions, Db } from 'mongodb';

import {
  getCastFunction,
  timestamp,
  MonglowCastSchema,
  CastFunction
} from './utils';

export interface MonglowModelOptions {
  cast?: MonglowCastSchema;
}

export interface MonglowModelQueueTask<T> {
  task: (collection: Collection<T>) => Promise<any>;
  resolve: (value?: any) => void;
  reject: (value?: any) => void;
}

class Model<T = any> {
  private queue: Array<MonglowModelQueueTask<T>>;
  private collectionName: string;
  private collectionPromise?: Promise<Collection<T>>;
  private castFunc: CastFunction;
  private filterCastFunc: CastFunction;

  public get name() {
    return this.collectionName;
  }

  constructor(name: string, options: MonglowModelOptions = {}) {
    ow(name, ow.string);
    ow(options, ow.object.plain);
    this.collectionName = name;
    this.queue = [];
    if (options.cast) {
      this.castFunc = getCastFunction({ schema: options.cast });
      this.filterCastFunc = getCastFunction({
        schema: options.cast,
        strict: false
      });
    } else {
      this.castFunc = getCastFunction();
      this.filterCastFunc = getCastFunction({ strict: false });
    }
  }

  private resolveQueue(collection: Collection<T>) {
    return Promise.all(
      this.queue.map(({ task, resolve, reject }) => {
        return Promise.resolve(task(collection))
          .then(resolve)
          .catch(reject);
      })
    );
  }

  public init(clientPromise: Promise<MongoClient>) {
    ow(clientPromise, ow.promise);
    this.collectionPromise = clientPromise.then(async client => {
      const collection = client.db().collection<T>(this.name);
      await this.resolveQueue(collection);
      return collection;
    });
    return this;
  }

  public exec(task: (collection: Collection<T>) => any): Promise<any> {
    ow(task, ow.function);
    if (this.collectionPromise) {
      return this.collectionPromise.then(collection => {
        return Promise.resolve(task(collection));
      });
    } else {
      return new Promise((resolve, reject) => {
        this.queue.push({ task, resolve, reject });
      });
    }
  }

  public find(filter = {}, findOptions?: FindOneOptions): Promise<T[]> {
    ow(filter, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.exec(c => {
      const cursor = c.find(this.filterCastFunc(filter), findOptions);
      return cursor.toArray();
    });
  }

  public findOne(filter = {}, findOptions?: FindOneOptions): Promise<T> {
    ow(filter, ow.object.plain);
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.exec(c => c.findOne(this.filterCastFunc(filter), findOptions));
  }

  public findById(
    id: string | ObjectId,
    findOptions?: FindOneOptions
  ): Promise<T> {
    ow(
      id,
      ow.any(ow.string, ow.object.instanceOf(ObjectId), ow.nullOrUndefined)
    );
    ow(findOptions, ow.any(ow.object.plain, ow.undefined));
    return this.findOne({ _id: id }, findOptions);
  }

  public updateOne(
    filter: any,
    set: any
  ): Promise<{ ok: number; n: number; nModified: number }> {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(this.castFunc(set)) };
    return this.exec(c => {
      return c
        .updateOne(this.castFunc(filter), update)
        .then(response => response.result);
    });
  }

  public updateMany(
    filter: any,
    set: any
  ): Promise<{ ok: number; n: number; nModified: number }> {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(this.castFunc(set)) };
    return this.exec(c =>
      c
        .updateMany(this.filterCastFunc(filter), update)
        .then(response => response.result)
    );
  }

  public insertOne(
    document: any
  ): Promise<{
    ok: number;
    n: number;
  }> {
    ow(document, ow.object.plain);
    const insert = timestamp(this.castFunc(document), { created: true });
    return this.exec(c =>
      c.insertOne(insert).then(response => response.result)
    );
  }

  public insertMany(
    documents: any[]
  ): Promise<{
    ok: number;
    n: number;
  }> {
    ow(documents, ow.array);
    const insert = timestamp(this.castFunc(documents), { created: true });
    return this.exec(c =>
      c.insertMany(insert).then(response => response.result)
    );
  }

  public deleteOne(
    filter: any
  ): Promise<{
    ok: number;
    n: number;
  }> {
    ow(filter, ow.object.plain);
    return this.exec(c =>
      c.deleteOne(this.filterCastFunc(filter)).then(response => response.result)
    );
  }

  public deleteMany(
    filter: any
  ): Promise<{
    ok: number;
    n: number;
  }> {
    ow(filter, ow.object.plain);
    return this.exec(c =>
      c
        .deleteMany(this.filterCastFunc(filter))
        .then(response => response.result)
    );
  }
}

export default Model;
