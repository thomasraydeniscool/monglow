import ow from 'ow';
import MonglowDocument from './Document';
import { Cursor } from 'mongodb';

class MonglowResponse {
  public static fromCursor(
    cursor: Cursor<any>,
    options: { cursor: true }
  ): Cursor<any>;
  public static fromCursor(
    cursor: Cursor<any>,
    options?: { cursor?: false }
  ): Promise<MonglowResponse>;
  public static fromCursor(
    cursor: Cursor<any>,
    options: { cursor?: boolean } = { cursor: false }
  ): Promise<MonglowResponse> | Cursor<any> {
    ow(cursor, ow.object.instanceOf(Cursor));
    ow(options, ow.object.plain);
    if (options.cursor) {
      return cursor;
    }
    return (async () => {
      const data = await cursor.toArray();
      return new MonglowResponse(data);
    })();
  }

  public static async fromPromise(
    task: Promise<any>,
    options: { wrap: true }
  ): Promise<MonglowResponse>;
  public static async fromPromise(
    task: Promise<any>,
    options?: { wrap?: false }
  ): Promise<MonglowDocument>;
  public static async fromPromise(
    task: Promise<any>,
    options: { wrap?: boolean } = { wrap: false }
  ): Promise<MonglowDocument | MonglowResponse> {
    ow(task, ow.promise);
    ow(options, ow.object.plain);
    const data = await task;
    if (options.wrap) {
      return new MonglowResponse(data);
    }
    return new MonglowDocument(data);
  }

  private docs: MonglowDocument[];

  private constructor(data: any) {
    ow(data, ow.object.plain);
    this.docs = Array.isArray(data)
      ? data.map(d => new MonglowDocument(d))
      : [new MonglowDocument(data)];
  }

  public toArray(defaults = {}) {
    ow(defaults, ow.object.plain);
    return this.docs.map(doc => doc.toObject(defaults));
  }
}

export default MonglowResponse;
