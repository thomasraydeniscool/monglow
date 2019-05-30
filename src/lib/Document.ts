import ow from 'ow';

class MonglowDocument {
  private data: any;

  constructor(data: any) {
    this.data = data;
  }

  public toObject(defaults = {}) {
    ow(defaults, ow.object.plain);
    return {
      ...defaults,
      ...this.data
    };
  }
}

export default MonglowDocument;
