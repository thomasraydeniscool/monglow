import Monglow, { MonglowClientOptions } from './lib/Monglow';
import Model from './lib/Model';

export * from './lib/utils';

export { Monglow, Model };

export default (uri: string | string[], options?: MonglowClientOptions) => {
  return new Monglow(uri, options);
};
