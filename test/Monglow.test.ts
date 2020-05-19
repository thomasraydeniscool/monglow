import { ObjectId } from 'mongodb';
import { Model, Monglow } from '../src';

const global = {
  __MONGO_URI__: 'localhost/test'
};

function createMockDocument() {
  return { _id: new ObjectId() };
}

describe('monglow', () => {
  const uri = global.__MONGO_URI__;
  const model = new Model('model');
  const monglow = new Monglow(uri);

  beforeAll(async () => {
    /**
     * Command buffering
     */
    monglow.connect();
    monglow.activate(model);
  });

  afterAll(async () => {
    monglow.close();
  });

  test('find', async () => {
    const mockDocument = createMockDocument();
    await model.insertOne(mockDocument);
    const response = await model.find({});
    expect(response).toHaveLength(1);
  });

  test('findOne', async () => {
    const mockDocument = createMockDocument();
    await model.insertOne(mockDocument);
    const response = await model.findOne({ _id: mockDocument._id });
    expect(response._id).toEqual(mockDocument._id);
  });

  test('findById', async () => {
    const mockDocument = createMockDocument();
    await model.insertOne(mockDocument);
    const response = await model.findById(mockDocument._id);
    expect(response._id).toEqual(mockDocument._id);
  });

  test('updateOne', async () => {
    const mockDocument = createMockDocument();
    await model.insertOne(mockDocument);
    const response = await model.updateOne(
      { _id: mockDocument._id },
      { hello: 'world' }
    );
    expect(response.result.ok).toBeTruthy();
  });

  test('updateMany', async () => {
    const mockDocuments = [createMockDocument(), createMockDocument()];
    await model.insertMany(mockDocuments);
    const response = await model.updateMany(
      { _id: { $in: mockDocuments.map(d => d._id) } },
      { hello: 'world' }
    );
    expect(response.result.ok).toBeTruthy();
  });

  test('insertOne', async () => {
    const mockDocument = createMockDocument();
    const response = await model.insertOne(mockDocument);
    expect(response.result.ok).toBeTruthy();
  });

  test('insertMany', async () => {
    const mockDocuments = [createMockDocument(), createMockDocument()];
    const response = await model.insertMany(mockDocuments);
    expect(response.result.ok).toBeTruthy();
  });

  test('deleteOne', async () => {
    const mockDocument = createMockDocument();
    await model.insertOne(mockDocument);
    const response = await model.deleteOne({
      _id: mockDocument._id
    });
    expect(response.result.ok).toBeTruthy();
  });

  test('deleteMany', async () => {
    const mockDocuments = [createMockDocument(), createMockDocument()];
    await model.insertMany(mockDocuments);
    const response = await model.deleteMany({
      _id: { $in: mockDocuments.map(d => d._id) }
    });
    expect(response.result.ok).toBeTruthy();
  });
});
