import ow from 'ow';
import { MongoClient, MongoClientOptions } from 'mongodb';

import Model from './Model';

class Monglow {
  private urls: string[];
  private options: MongoClientOptions;
  private clientPromise: Promise<MongoClient>;

  constructor(urls: string | string[], options: MongoClientOptions = {}) {
    ow(urls, ow.any(ow.string, ow.array.minLength(1)));
    ow(options, ow.object.plain);
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.options = { useNewUrlParser: true, ...options };
    this.clientPromise = MongoClient.connect(this.urls.join(','), this.options);
  }

  public get client() {
    return this.clientPromise;
  }

  public activate(model: Model): Model {
    ow(model, ow.object.instanceOf(Model));
    return model.init(this.clientPromise);
  }
}

export default Monglow;
