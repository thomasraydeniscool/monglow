import ow from 'ow';

class MonglowDocument {
  public static create(data: any) {
    if (data) {
      return new MonglowDocument(data);
    } else {
      return data;
    }
  }

  private data: any;

  private constructor(data: any) {
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
