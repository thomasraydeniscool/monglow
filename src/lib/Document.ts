import ow from 'ow';

class MonglowDocument {
  private data: any;

  constructor(data: any) {
    ow(data, ow.any(ow.object.plain, ow.null, ow.undefined));
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
