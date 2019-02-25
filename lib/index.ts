import ow from 'ow';
import { MongoClient } from 'mongodb';

export class Monglow {
  private urls: string[];
  private options: any;

  private db: any;


  constructor(urls: string | string[], options = {}) {
    ow(urls, ow.any(ow.string, ow.array.minLength(1)));
    ow(options, ow.object)
    this.urls = Array.isArray(urls) ? urls : [urls]
    this.options = options;
  }

  public connect() {
    return MongoClient.connect(this.urls.join(',')).then((db) => {
      this.db = db;
    });
  }
}
