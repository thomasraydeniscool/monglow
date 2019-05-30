import {
  ObjectId,
  Timestamp,
  MinKey,
  MaxKey,
  DBRef,
  Long,
  MongoClientOptions
} from 'mongodb';
import Monglow from './Monglow';
import Model from './Model';

export { Monglow, Model, ObjectId, Timestamp, MinKey, MaxKey, DBRef, Long };

export default (uri: string | string[], options?: MongoClientOptions) => {
  return new Monglow(uri);
};
