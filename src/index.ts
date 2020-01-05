import { MongoClientOptions } from 'mongodb';

import Monglow from './lib/Monglow';
import Model from './lib/Model';

export * from './lib/utils';

export { Monglow, Model };

export default (uri: string | string[], options?: MongoClientOptions) => {
  return new Monglow(uri, options);
};
