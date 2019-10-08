import { ObjectId } from 'mongodb';

export type MonglowCast = (value: any) => any;
export interface MonglowCastSchema {
  [key: string]: MonglowCast | boolean;
}

export type CastFunction = (document: any | any[]) => any;

export const ISODate = () => new Date(new Date().toISOString());

export const cast = (
  options: { strict?: boolean; schema?: MonglowCastSchema } = {}
): CastFunction => {
  return (document: any | any[]) => {
    if (Array.isArray(document)) {
      return document.map(cast(options));
    } else if (typeof document === 'object') {
      const { strict = true, schema = {} } = options;
      const result = { ...document };
      const keys = ['_id', ...Object.keys(schema)];
      Object.keys(result).forEach(d => {
        if (keys.indexOf(d) !== -1 && result[d]) {
          const castFunc = schema[d];
          if (typeof castFunc === 'function') {
            result[d] = castFunc(result[d]);
          } else if (castFunc !== false) {
            result[d] = deepCast(result[d], strict);
          }
        }
      });
      return result;
    } else {
      return document;
    }
  };
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

export function deepCast(value: any, strict: boolean = true) {
  const operators = { array: ['$in', '$nin'], string: ['$ne'] };
  if (typeof value === 'object') {
    const copy = { ...value };
    Object.keys(copy).forEach(o => {
      if (operators.array.indexOf(o) !== -1) {
        copy[o].map(strict ? strictId : lazyId);
      } else if (operators.string.indexOf(o) !== -1) {
        copy[o] = strict ? strictId(copy[o]) : lazyId(copy[o]);
      }
    });
    return copy;
  } else if (typeof value === 'string') {
    return strict ? strictId(value) : lazyId(value);
  }
}

/**
 * lazyId
 *
 * Cast to ObjectId if valid otherwise return original value
 */
export function lazyId(id: any) {
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  } else {
    return id;
  }
}

/**
 * safeId
 *
 * Depreciated due to poor name
 * @deprecated use lazyId
 */
export const safeId = lazyId;

/**
 * strictId
 *
 * MUST be a valid ObjectId
 */
export function strictId(id: any) {
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  } else {
    throw new TypeError(
      'Invalid ObjectId provided to strictId must be typeof ObjectId'
    );
  }
}
