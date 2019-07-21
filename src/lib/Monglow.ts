import ow from 'ow';
import { MongoClient, MongoClientOptions } from 'mongodb';

import Model from './Model';

enum MonglowConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED'
}

class Monglow {
  private urls: string[];
  private options: MongoClientOptions;
  private state: MonglowConnectionState;
  private clientPromise: Promise<MongoClient> | null;
  private client: MongoClient | null;

  constructor(urls: string | string[], options: MongoClientOptions = {}) {
    ow(urls, ow.any(ow.string, ow.array.minLength(1)));
    ow(options, ow.object.plain);
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.options = { useNewUrlParser: true, ...options };
    this.state = MonglowConnectionState.DISCONNECTED;
    this.client = null;
    this.clientPromise = null;
  }

  public get instance(): Promise<MongoClient> {
    if (this.clientPromise && MonglowConnectionState.PENDING) {
      return this.clientPromise;
    } else if (this.client && MonglowConnectionState.CONNECTED) {
      return Promise.resolve(this.client);
    } else {
      return this.connect();
    }
  }

  public connect(): Promise<MongoClient> {
    if (this.state !== MonglowConnectionState.DISCONNECTED) {
      return this.instance;
    }
    this.state = MonglowConnectionState.PENDING;
    this.clientPromise = MongoClient.connect(
      this.urls.join(','),
      this.options
    ).then(client => {
      this.state = MonglowConnectionState.CONNECTED;
      this.client = client;
      return client;
    });
    return this.clientPromise;
  }

  public async disconnect(): Promise<void> {
    this.instance.then(client => {
      client.close();
      this.state = MonglowConnectionState.DISCONNECTED;
    });
  }

  public model(name: string): Model {
    ow(name, ow.string);
    const model = new Model(name);
    return this.activate(model);
  }

  public activate(model: Model): Model {
    ow(model, ow.object.instanceOf(Model));
    return model.init(this.instance);
  }
}

export default Monglow;
