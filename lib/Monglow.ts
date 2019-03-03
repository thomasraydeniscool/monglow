import ow from 'ow';
import { MongoClient, MongoClientOptions } from 'mongodb';
import Model from './Model';

class Monglow {
  private urls: string[];
  private options: MongoClientOptions;

  private client!: MongoClient;

  constructor(urls: string | string[], options: MongoClientOptions = {}) {
    ow(urls, ow.any(ow.string, ow.array.minLength(1)));
    ow(options, ow.object)
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.options = { useNewUrlParser: true, ...options };
  }

  public async connect() {
    this.client = await MongoClient.connect(this.urls.join(','), this.options);
    return this.client;
  }

  public async disconnect() {
    if (this.client) {
      this.client.close();
    }
  }

  public model(name: string) {
    return Model.create(name, this.client.db());
  }

  public activate(model: Model) {
    return model.attach(this.client.db());
  }
}

export default Monglow;