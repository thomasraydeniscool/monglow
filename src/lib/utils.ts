import { ObjectId } from 'mongodb';

export type MonglowCast = (value: any) => any;
export type MonglowCastSchema = { [key: string]: MonglowCast | boolean };

export const ISODate = () => new Date(new Date().toISOString());

export const cast = (
  document: any | any[],
  options: { schema?: MonglowCastSchema } = {}
): any => {
  if (Array.isArray(document)) {
    return document.map(d => cast(d, options));
  } else if (typeof document === 'object') {
    const result = { ...document };
    const schema: MonglowCastSchema = options.schema || {};
    const keys = ['_id', ...Object.keys(schema)];
    Object.keys(result).forEach(d => {
      if (keys.indexOf(d) !== -1 && result[d]) {
        const castFunc = schema[d];
        if (typeof castFunc === 'function') {
          result[d] = castFunc(result[d]);
        } else if (castFunc !== false) {
          result[d] = deepCast(result[d]);
        }
      }
    });
    return result;
  } else {
    return document;
  }
};

export const timestamp = (
  document: any | any[],
  options: { created?: boolean } = {}
): any => {
  if (Array.isArray(document)) {
    return document.map(d => timestamp(d, options));
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

export function deepCast(value: any) {
  const operators = { array: ['$in', '$nin'], string: ['$ne'] };
  if (typeof value === 'object') {
    const copy = { ...value };
    Object.keys(copy).forEach(o => {
      if (operators.array.indexOf(o) !== -1) {
        copy[o].map(safeId);
      } else if (operators.string.indexOf(o) !== -1) {
        copy[o] = safeId(copy[o]);
      }
    });
    return copy;
  } else if (typeof value === 'string') {
    return safeId(value);
  }
}

/**
 * Either ObjectId or String but not undefined
 */
export function safeId(id?: string | ObjectId) {
  if (!id) {
    throw new TypeError('No id provided to safeId');
  }
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  } else if (typeof id === 'string') {
    return id;
  } else {
    throw new TypeError(
      'Invalid Object provider to safeId must be typeof ObjectId or String'
    );
  }
}

/**
 * MUST be a valid ObjectId
 */
export function strictId(id?: string | ObjectId) {
  if (!id) {
    throw new TypeError('No id provided to strictId');
  }
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  } else {
    throw new TypeError(
      'Invalid ObjectId provided to strictId must be typeof ObjectId'
    );
  }
}
