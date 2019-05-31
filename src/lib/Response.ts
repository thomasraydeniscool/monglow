import ow from 'ow';
import MonglowDocument from './Document';

class MonglowResponse {
  public static async create(
    task: Promise<any>,
    options?: { wrap?: boolean; cursor?: boolean }
  ): Promise<MonglowDocument>;
  public static async create(
    task: Promise<any[]>,
    options?: { wrap?: boolean; cursor?: boolean }
  ): Promise<MonglowResponse>;
  public static async create(
    task: Promise<any>,
    options: { wrap: true; cursor?: boolean }
  ): Promise<MonglowResponse>;
  public static async create(
    task: Promise<any>,
    options: { wrap?: boolean; cursor?: boolean } = {
      wrap: false,
      cursor: false,
    }
  ) {
    ow(task, ow.promise);
    ow(options, ow.object.plain);
    if (options.cursor) {
      return task;
    }
    const data = await task;
    if (Array.isArray(data)) {
      return new MonglowResponse(data);
    } else if (options.wrap) {
      return new MonglowResponse(data);
    } else {
      return new MonglowDocument(data);
    }
  }

  private docs: MonglowDocument[];

  private constructor(data: any) {
    this.docs = Array.isArray(data)
      ? data.map(d => new MonglowDocument(d))
      : [new MonglowDocument(data)];
  }

  public toArray(defaults = {}) {
    return this.docs.map(doc => doc.toObject(defaults));
  }
}

export default MonglowResponse;
