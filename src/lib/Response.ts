import ow from 'ow';
import MonglowDocument from './Document';

class MonglowResponse {
  public static create(data: any) {
    return new MonglowResponse(data);
  }

  private docs: MonglowDocument[];

  private constructor(data: any) {
    ow(data, ow.any(ow.array, ow.object.plain));
    this.docs = Array.isArray(data)
      ? data.map(d => MonglowDocument.create(d))
      : [MonglowDocument.create(data)];
  }

  public toArray(defaults = {}) {
    ow(defaults, ow.object.plain);
    return this.docs.map(doc => doc.toObject(defaults));
  }
}

export default MonglowResponse;
