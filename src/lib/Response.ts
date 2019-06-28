import ow from 'ow';
import MonglowDocument from './Document';

class MonglowResponse {
  private docs: MonglowDocument[];

  constructor(data: any) {
    ow(data, ow.any(ow.array, ow.object.plain));
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
