import ow from 'ow';
import { EventEmitter2 } from 'eventemitter2';
import {
  Collection,
  MongoClient,
  ObjectId,
  FindOneOptions,
  UpdateManyOptions,
  CollectionInsertOneOptions,
  CollectionInsertManyOptions,
  CommonOptions,
  UpdateOneOptions,
  FilterQuery
} from 'mongodb';

import {
  getCastFunction,
  MonglowCastFunction,
  getTimestampFunction,
  MonglowTimestampOptions,
  MonglowCastOptions,
  getDummyCastFunction,
  MonglowTimestampFunction
} from './utils';

export interface MonglowModelOptions {
  description?: string;
  cast?: boolean;
  castOptions?: MonglowCastOptions;
  filterCastOptions?: MonglowCastOptions;
  timestamp?: boolean;
  timestampOptions?: MonglowTimestampOptions;
}

class Model<T = any> {
  private modelEmitter: EventEmitter2;

  private collectionName: string;
  public get name() {
    return this.collectionName;
  }
  private collectionPromise: Promise<Collection<T>>;
  public get collection(): Promise<Collection<T>> {
    return this.collectionPromise;
  }
  private _description?: string;
  public get description() {
    return this._description;
  }

  private castFunc: MonglowCastFunction;
  private filterCastFunc: MonglowCastFunction;
  private timestampFunc: MonglowTimestampFunction;

  constructor(name: string, options: MonglowModelOptions = {}) {
    ow(name, ow.string);
    ow(options, ow.object.plain);
    this.modelEmitter = new EventEmitter2();
    this.collectionName = name;
    this.collectionPromise = new Promise(resolve => {
      this.modelEmitter.on('collection', resolve);
    });
    const { cast = true, timestamp = true, description } = options;
    this._description = description;
    if (cast) {
      const {
        castOptions = { strict: true },
        filterCastOptions = { strict: false }
      } = options;
      this.castFunc = getCastFunction(castOptions);
      this.filterCastFunc = getCastFunction(filterCastOptions);
    } else {
      this.castFunc = getDummyCastFunction();
      this.filterCastFunc = getDummyCastFunction();
    }
    if (timestamp) {
      const { timestampOptions = {} } = options;
      this.timestampFunc = getTimestampFunction(timestampOptions);
    } else {
      this.timestampFunc = getDummyCastFunction();
    }
  }

  public init(clientPromise: Promise<MongoClient>) {
    ow(clientPromise, ow.promise);
    clientPromise.then(client => {
      this.modelEmitter.emit(
        'collection',
        client.db().collection(this.collectionName)
      );
    });
    return this;
  }

  public find(filter: FilterQuery<T>, options?: FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    return this.collection.then(c => {
      const cursor = c.find(this.filterCastFunc(filter), options);
      return cursor.toArray();
    });
  }

  public findOne(filter: FilterQuery<T>, options?: FindOneOptions) {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    return this.collection.then(c =>
      c.findOne(this.filterCastFunc(filter), options)
    );
  }

  public findById(id: string | ObjectId, options?: FindOneOptions) {
    ow(id, ow.any(ow.string, ow.object.instanceOf(ObjectId)));
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    return this.findOne({ _id: id }, options);
  }

  public updateOne(
    filter: FilterQuery<T>,
    $set: Partial<T> | { [key: string]: any },
    options?: UpdateOneOptions
  ) {
    ow(filter, ow.object.plain);
    ow($set, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    const update = { $set: this.timestampFunc(this.castFunc($set)) };
    return this.collection.then(c =>
      c.updateOne(this.filterCastFunc(filter), update)
    );
  }

  public updateById(
    id: string | ObjectId,
    $set: Partial<T> | { [key: string]: any },
    options?: UpdateOneOptions
  ) {
    ow(id, ow.any(ow.string, ow.object.instanceOf(ObjectId)));
    ow($set, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    return this.updateOne({ _id: id }, $set, options);
  }

  public updateMany(
    filter: FilterQuery<T>,
    $set: Partial<T> | { [key: string]: any },
    options?: UpdateManyOptions
  ) {
    ow(filter, ow.object.plain);
    ow($set, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    const update = { $set: this.timestampFunc(this.castFunc($set)) };
    return this.collection.then(c =>
      c.updateMany(this.filterCastFunc(filter), update, options)
    );
  }

  public insertOne(document: any, options?: CollectionInsertOneOptions) {
    ow(document, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    const insert = this.timestampFunc(this.castFunc(document), true);
    return this.collection.then(c => c.insertOne(insert, options));
  }

  public insertMany(documents: any[], options?: CollectionInsertManyOptions) {
    ow(documents, ow.array.ofType(ow.object.plain));
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    const insert = this.timestampFunc(this.castFunc(documents), true);
    return this.collection.then(c => c.insertMany(insert, options));
  }

  public deleteOne(
    filter: FilterQuery<T>,
    options?: CommonOptions & { bypassDocumentValidation?: boolean }
  ) {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    return this.collection.then(c =>
      c.deleteOne(this.filterCastFunc(filter), options)
    );
  }

  public deleteById(
    id: string | ObjectId,
    options?: CommonOptions & { bypassDocumentValidation?: boolean }
  ) {
    ow(id, ow.any(ow.string, ow.object.instanceOf(ObjectId)));
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    return this.deleteOne({ _id: id }, options);
  }

  public deleteMany(filter: FilterQuery<T>, options?: CommonOptions) {
    ow(filter, ow.object.plain);
    ow(options, ow.any(ow.object.plain, ow.nullOrUndefined));
    return this.collection.then(c =>
      c.deleteMany(this.filterCastFunc(filter), options)
    );
  }
}

export default Model;
