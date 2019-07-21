import { ObjectId } from 'mongodb';

export const ISODate = () => new Date(new Date().toISOString());
export const toId = (id: string | ObjectId) => new ObjectId(id);

export const cast = (document: any): any => {
  const operators = { array: ['$in', '$nin'], string: ['$ne'] };

  if (Array.isArray(document)) {
    return document.map(cast);
  }

  if (document && typeof document === 'object') {
    Object.keys(document).forEach(d => {
      if (d === '_id' && document._id) {
        if (typeof document._id === 'object') {
          const keys = Object.keys(document._id);
          keys.forEach(o => {
            if (operators.array.indexOf(o) !== -1) {
              document._id[o].map(toId);
            } else if (operators.string.indexOf(o) !== -1) {
              document._id[o] = toId(document._id[o]);
            }
          });
        } else {
          document._id = toId(document._id);
        }
      } else {
        document[d] = cast(document[d]);
      }
    });
  }

  return document;
};

export const timestamp = (document: any, created: boolean = false): any => {
  const result = { ...document, updatedAt: ISODate() };
  if (created) {
    result.createdAt = ISODate();
  }
  return result;
};
