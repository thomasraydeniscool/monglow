import { ObjectId } from 'mongodb';

export type MonglowCustomCast = (value: any) => any;
export interface MonglowCastSchema {
  [key: string]: MonglowCustomCast | boolean;
}

export type MonglowCastFunction = (document: any) => any;
export interface MonglowCastOptions {
  strict?: boolean;
  schema?: MonglowCastSchema;
}

export const getCastFunction = (
  opt: MonglowCastOptions = {}
): MonglowCastFunction => {
  const func: MonglowCastFunction = document => {
    if (Array.isArray(document)) {
      return document.map(getCastFunction(opt));
    } else if (typeof document === 'object') {
      const { strict = true, schema = {} } = opt;
      const result = { ...document };
      const keys = ['_id', ...Object.keys(schema)];
      Object.keys(result).forEach(d => {
        if (keys.indexOf(d) !== -1 && result[d]) {
          const castFunc = schema[d];
          if (typeof castFunc === 'function') {
            result[d] = castFunc(result[d]);
          } else if (castFunc !== false) {
            result[d] = automaticCast(result[d], { strict });
          }
        }
      });
      return result;
    } else {
      return document;
    }
  };
  return func;
};

export type MonglowTimestampFunction = (
  document: any,
  created?: boolean
) => any;

export interface MonglowTimestampOptions {
  createdProperty?: string;
  updatedProperty?: string;
}

export const getTimestampFunction = (
  opt: MonglowTimestampOptions = {}
): MonglowTimestampFunction => {
  const { createdProperty = '_created', updatedProperty = '_updated' } = opt;
  const func: MonglowTimestampFunction = (
    document: any | any[],
    created: boolean = false
  ): any | any[] => {
    if (Array.isArray(document)) {
      return document.map(d => func(d));
    } else if (typeof document === 'object') {
      const result = { ...document, [updatedProperty]: new Date() };
      if (created) {
        result[createdProperty] = new Date();
      }
      return result;
    } else {
      return document;
    }
  };
  return func;
};

export const getDummyCastFunction = ():
  | MonglowCastFunction
  | MonglowTimestampFunction => {
  const func: MonglowCastFunction = value => value;
  return func;
};

export function automaticCast(value: any, opt: { strict?: boolean } = {}) {
  const { strict = true } = opt;
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
