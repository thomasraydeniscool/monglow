import ow from 'ow';
import {
  Collection,
  MongoClient,
  ObjectId,
  FindOneOptions,
  Db,
  UpdateManyOptions,
  UpdateWriteOpResult,
  InsertOneWriteOpResult,
  InsertWriteOpResult,
  DeleteWriteOpResultObject,
  CollectionInsertOneOptions,
  CollectionInsertManyOptions,
  CommonOptions,
  UpdateOneOptions
} from 'mongodb';

import {
  getCastFunction,
  timestamp,
  MonglowCastSchema,
  CastFunction,
  MonglowQueueTask,
  resolveQueue,
  promiseOrQueue
} from './utils';

export interface MonglowModelOptions {
  cast?: MonglowCastSchema;
}

class Model<T = any> {
  private queue: Array<MonglowQueueTask<Collection<T>>>;
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

  public init(clientPromise: Promise<MongoClient>) {
    ow(clientPromise, ow.promise);
    this.collectionPromise = clientPromise.then(async client => {
      const collection = client.db().collection<T>(this.name);
      await resolveQueue(this.queue, collection).then(() => {
        this.queue = [];
      });
      return collection;
    });
    return this;
  }

  public exec(task: (collection: Collection<T>) => any): Promise<any> {
    ow(task, ow.function);
    const { promise, queue } = promiseOrQueue(
      task,
      this.queue,
      this.collectionPromise
    );
    this.queue = queue;
    return promise;
  }

  public find(filter = {}, options?: FindOneOptions): Promise<T[]> {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.undefined));
    return this.exec(c => {
      const cursor = c.find(this.filterCastFunc(filter), options);
      return cursor.toArray();
    });
  }

  public findOne(filter = {}, options?: FindOneOptions): Promise<T> {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.undefined));
    return this.exec(c => c.findOne(this.filterCastFunc(filter), options));
  }

  public findById(id: string | ObjectId, options?: FindOneOptions): Promise<T> {
    ow(
      id,
      ow.any(ow.string, ow.object.instanceOf(ObjectId), ow.nullOrUndefined)
    );
    ow(options, ow.any(ow.object.plain, ow.undefined));
    return this.findOne({ _id: id }, options);
  }

  public updateOne(
    filter: any,
    set: any,
    options?: UpdateOneOptions
  ): Promise<{ ok: number; n: number; nModified: number }> {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(this.castFunc(set)) };
    return this.exec(c =>
      c.updateOne(this.filterCastFunc(filter), update, options)
    );
  }

  public updateMany(
    filter: any,
    set: any,
    options?: UpdateManyOptions
  ): Promise<UpdateWriteOpResult> {
    ow(filter, ow.object.plain);
    ow(set, ow.object.plain);
    const update = { $set: timestamp(this.castFunc(set)) };
    return this.exec(c =>
      c.updateMany(this.filterCastFunc(filter), update, options)
    );
  }

  public insertOne(
    document: any,
    options?: CollectionInsertOneOptions
  ): Promise<InsertOneWriteOpResult> {
    ow(document, ow.object.plain);
    const insert = timestamp(this.castFunc(document), { created: true });
    return this.exec(c => c.insertOne(insert, options));
  }

  public insertMany(
    documents: any[],
    options?: CollectionInsertManyOptions
  ): Promise<InsertWriteOpResult> {
    ow(documents, ow.array);
    const insert = timestamp(this.castFunc(documents), { created: true });
    return this.exec(c => c.insertMany(insert, options));
  }

  public deleteOne(
    filter: any,
    options?: CommonOptions & { bypassDocumentValidation?: boolean }
  ): Promise<DeleteWriteOpResultObject> {
    ow(filter, ow.object.plain);
    return this.exec(c => c.deleteOne(this.filterCastFunc(filter), options));
  }

  public deleteMany(
    filter: any,
    options?: CommonOptions
  ): Promise<DeleteWriteOpResultObject> {
    ow(filter, ow.object.plain);
    return this.exec(c => c.deleteMany(this.filterCastFunc(filter), options));
  }
}

export default Model;
