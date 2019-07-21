import { ObjectId } from 'mongodb';

export const ISODate = () => new Date(new Date().toISOString());
export const toId = (id: string | ObjectId) => new ObjectId(id);

export const cast = (document: any): any => {
  const operators = { array: ['$in', '$nin'], string: ['$ne'] };

  if (Array.isArray(document)) {
    return document.map(cast);
  } else if (typeof document === 'object') {
    const result = { ...document };

    Object.keys(result).forEach(d => {
      if (d === '_id' && result._id) {
        if (typeof result._id === 'object') {
          const keys = Object.keys(result._id);
          keys.forEach(o => {
            if (operators.array.indexOf(o) !== -1) {
              result._id[o].map(toId);
            } else if (operators.string.indexOf(o) !== -1) {
              result._id[o] = toId(result._id[o]);
            }
          });
        } else if (typeof result._id === 'string') {
          result._id = toId(result._id);
        }
      }
    });

    return result;
  } else {
    return document;
  }
};

export const timestamp = (options: { created?: boolean } = {}) => (
  document: any
): any => {
  if (Array.isArray(document)) {
    return document.map(timestamp(options));
  } else if (typeof document === 'object') {
    const result = { ...document, updatedAt: ISODate() };

    if (options.created) {
      result.createdAt = ISODate();
    }

    return result;
  } else {
    return document;
  }
};
