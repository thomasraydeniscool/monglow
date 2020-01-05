import ow from 'ow';
import { MongoClient, MongoClientOptions } from 'mongodb';

import Model from './Model';
import { MonglowQueueTask, promiseOrQueue } from './utils';

class Monglow {
  private queue: Array<MonglowQueueTask<MongoClient>>;
  private urls: string[];
  private options: MongoClientOptions;
  private clientPromise?: Promise<MongoClient>;

  constructor(urls: string | string[], options: MongoClientOptions = {}) {
    ow(urls, ow.any(ow.string, ow.array.minLength(1)));
    ow(options, ow.object.plain);
    this.queue = [];
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.options = { useNewUrlParser: true, ...options };
  }

  public init() {
    if (this.clientPromise) {
      return this.clientPromise;
    }
    const clientPromise = MongoClient.connect(
      this.urls.join(','),
      this.options
    );
    this.clientPromise = clientPromise;
    return clientPromise;
  }

  public exec(task: (client: MongoClient) => any): Promise<any> {
    ow(task, ow.function);
    const { promise, queue } = promiseOrQueue(
      task,
      this.queue,
      this.clientPromise
    );
    this.queue = queue;
    return promise;
  }

  public activate(model: Model): Model {
    ow(model, ow.object.instanceOf(Model));
    return model.init(this.init());
  }
}

export default Monglow;
