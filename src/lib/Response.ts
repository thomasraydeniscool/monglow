import ow from 'ow';
import MonglowDocument from './Document';

class MonglowResponse {
  public static async create(
    task: Promise<any>,
    wrap: false
  ): Promise<MonglowDocument>;
  public static async create(
    task: Promise<any>,
    wrap: true
  ): Promise<MonglowResponse>;
  public static async create(
    task: Promise<any[]>,
    wrap: false
  ): Promise<MonglowResponse>;
  public static async create(task: Promise<any>, wrap = false) {
    ow(task, ow.promise);
    const data = await task;
    if (Array.isArray(data)) {
      return new MonglowResponse(data);
    } else if (wrap) {
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
