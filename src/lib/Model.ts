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
  FilterQuery,
  UpdateQuery,
  OptionalId
} from 'mongodb';

export interface MonglowModelOptions {}

export class Model<T extends { [key: string]: any } = any> {
  private modelEmitter: EventEmitter2;

  private collectionName: string;
  public get name() {
    return this.collectionName;
  }

  private collectionPromise: Promise<Collection<T>>;
  public get collection(): Promise<Collection<T>> {
    return this.collectionPromise;
  }

  constructor(name: string, options: MonglowModelOptions = {}) {
    ow(name, ow.string);
    ow(options, ow.object.plain);

    this.modelEmitter = new EventEmitter2();

    this.collectionName = name;

    this.collectionPromise = new Promise(resolve => {
      this.modelEmitter.on('collection', resolve);
    });
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
    return this.collection.then(c => {
      const cursor = c.find(filter, options);
      return cursor.toArray();
    });
  }

  public findOne(filter: FilterQuery<T>, options?: FindOneOptions) {
    return this.collection.then(c => c.findOne(filter, options));
  }

  public findById(id: string | ObjectId, options?: FindOneOptions) {
    return this.findOne({ _id: new ObjectId(id) } as any, options);
  }

  public updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T> | Partial<T>,
    options?: UpdateOneOptions
  ) {
    return this.collection.then(c => c.updateOne(filter, update, options));
  }

  public updateById(
    id: string | ObjectId,
    update: UpdateQuery<T> | Partial<T>,
    options?: UpdateOneOptions
  ) {
    return this.updateOne({ _id: new ObjectId(id) } as any, update, options);
  }

  public updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T> | Partial<T>,
    options?: UpdateManyOptions
  ) {
    return this.collection.then(c => c.updateMany(filter, update, options));
  }

  public insertOne(docs: OptionalId<T>, options?: CollectionInsertOneOptions) {
    return this.collection.then(c => c.insertOne(docs, options));
  }

  public insertMany(
    docs: OptionalId<T>[],
    options?: CollectionInsertManyOptions
  ) {
    return this.collection.then(c => c.insertMany(docs, options));
  }

  public deleteOne(
    filter: FilterQuery<T>,
    options?: CommonOptions & { bypassDocumentValidation?: boolean }
  ) {
    return this.collection.then(c => c.deleteOne(filter, options));
  }

  public deleteById(
    id: string | ObjectId,
    options?: CommonOptions & { bypassDocumentValidation?: boolean }
  ) {
    return this.deleteOne({ _id: new ObjectId(id) } as any, options);
  }

  public deleteMany(filter: FilterQuery<T>, options?: CommonOptions) {
    return this.collection.then(c => c.deleteMany(filter, options));
  }
}
