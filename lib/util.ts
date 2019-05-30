import { ObjectId } from 'mongodb';

export const ISODate = () => new Date(new Date().toISOString());

export interface ICasted {
  _id: ObjectId;
  [key: string]: any;
}

export const cast = (target: any): ICasted => {
  const casted = { ...target };
  if (casted._id != null) {
    casted._id = new ObjectId(casted._id);
  }
  return casted;
};
