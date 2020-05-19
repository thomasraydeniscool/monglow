import ow from 'ow';
import { MongoClient, MongoClientOptions } from 'mongodb';

import { Model } from './Model';
import { EventEmitter2 } from 'eventemitter2';

export interface MonglowClientOptions {
  nativeOptions?: MongoClientOptions;
}

export class Monglow {
  private monglowEmitter: EventEmitter2;

  private clientPromise: Promise<MongoClient>;
  public get client() {
    return this.clientPromise;
  }

  private connected: boolean;

  private urls: string[];
  private options: MongoClientOptions;

  constructor(urls: string | string[], options: MonglowClientOptions = {}) {
    ow(urls, ow.any(ow.string, ow.array.ofType(ow.string).minLength(1)));
    ow(options, ow.object.plain);

    this.connected = false;

    this.monglowEmitter = new EventEmitter2();

    this.clientPromise = new Promise(resolve => {
      this.monglowEmitter.on('client', resolve);
    });

    this.urls = Array.isArray(urls) ? urls : [urls];

    const { nativeOptions = {} } = options;

    this.options = { useNewUrlParser: true, ...nativeOptions };
  }

  public connect() {
    if (this.connected !== true) {
      this.connected = true;

      const mongodb = MongoClient.connect(this.urls.join(','), this.options);

      mongodb.then(client => {
        this.monglowEmitter.emit('client', client);
      });
    }
    return this.clientPromise;
  }

  public close() {
    return this.clientPromise.then(client => client.close());
  }

  public activate(model: Model): Model {
    ow(model, ow.object.instanceOf(Model));

    return model.init(this.clientPromise);
  }

  public connectAndActivate(model: Model): Model {
    this.connect();

    return this.activate(model);
  }
}
