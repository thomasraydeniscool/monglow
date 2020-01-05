import { ObjectId } from 'mongodb';

export type MonglowCast = (value: any) => any;
export interface MonglowCastSchema {
  [key: string]: MonglowCast | boolean;
}

export interface MonglowQueueTask<T> {
  task: (value: T) => any;
  resolve: (value?: any) => void;
  reject: (value?: any) => void;
}

export function promiseOrQueue<T>(
  task: (value: T) => any,
  queue: Array<MonglowQueueTask<T>>,
  promise?: Promise<T>
): { promise: Promise<any>; queue: Array<MonglowQueueTask<T>> } {
  const newQueue = [...queue];
  if (promise) {
    const taskPromise = promise.then(value => {
      return Promise.resolve(task(value));
    });
    return { promise: taskPromise, queue: newQueue };
  } else {
    const queuePromise = new Promise<any>((resolve, reject) => {
      newQueue.push({ task, resolve, reject });
    });
    return { promise: queuePromise, queue: newQueue };
  }
}

export function resolveQueue<T>(queue: Array<MonglowQueueTask<T>>, value: T) {
  return Promise.all(
    queue.map(({ task, resolve, reject }) => {
      return Promise.resolve(task(value))
        .then(resolve)
        .catch(reject);
    })
  );
}

export type CastFunction = (document: any | any[]) => any;

export const getCastFunction = (
  opt: { strict?: boolean; schema?: MonglowCastSchema } = {}
): CastFunction => {
  return (document: any | any[]) => {
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
};

export const timestamp = (
  document: any | any[],
  opt: {
    created?: boolean;
    createdProperty?: string;
    updatedProperty?: string;
  } = {}
): any => {
  const {
    created = false,
    createdProperty = '_created',
    updatedProperty = '_updated'
  } = opt;
  if (Array.isArray(document)) {
    return document.map(d => timestamp(d, opt));
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
