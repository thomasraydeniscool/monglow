import { ObjectId } from 'mongodb';

export const ISODate = () => new Date(new Date().toISOString());

export interface MonglowCasted {
  _id: ObjectId;
  [key: string]: any;
}

export const cast = (document: any): MonglowCasted => {
  const casted = { ...document };
  if (casted._id != null) {
    casted._id = new ObjectId(casted._id);
  }
  return casted;
};

export const timestamp = (document: any, created: boolean = false): any => {
  const result = { ...document, updatedAt: ISODate() };
  if (created) {
    result.createdAt = ISODate();
  }
  return result;
};
