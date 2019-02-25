import ow from 'ow';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { Model } from './Model';

export class Monglow {
  private urls: string[];
  private options: MongoClientOptions;

  private client!: MongoClient;

  constructor(urls: string | string[], options: MongoClientOptions = {}) {
    ow(urls, ow.any(ow.string, ow.array.minLength(1)));
    ow(options, ow.object)
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.options = options;
  }

  public async connect() {
    this.client = await MongoClient.connect(this.urls.join(','), this.options);
    return this.client;
  }

  public model(name: string) {
    return new Model(name, this.client.db());
  }
}
