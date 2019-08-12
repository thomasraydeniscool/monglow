import { Model, Monglow, ObjectId } from '../src';

declare const global: any;

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
    monglow.disconnect();
  });

  test('find', async () => {
    const mockDocument = createMockDocument();
    await model.insertOne(mockDocument);
    const response = await model.find();
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
    expect(response.ok).toBeTruthy();
  });

  test('updateMany', async () => {
    const mockDocuments = [createMockDocument(), createMockDocument()];
    await model.insertMany(mockDocuments);
    const response = await model.updateMany(
      { _id: { $in: mockDocuments.map(d => d._id) } },
      { hello: 'world' }
    );
    expect(response.ok).toBeTruthy();
  });

  test('insertOne', async () => {
    const mockDocument = createMockDocument();
    const response = await model.insertOne(mockDocument);
    expect(response.ok).toBeTruthy();
  });

  test('insertMany', async () => {
    const mockDocuments = [createMockDocument(), createMockDocument()];
    const response = await model.insertMany(mockDocuments);
    expect(response.ok).toBeTruthy();
  });

  test('deleteOne', async () => {
    const mockDocument = createMockDocument();
    await model.insertOne(mockDocument);
    const response = await model.deleteOne({
      _id: mockDocument._id
    });
    expect(response.ok).toBeTruthy();
  });

  test('deleteMany', async () => {
    const mockDocuments = [createMockDocument(), createMockDocument()];
    await model.insertMany(mockDocuments);
    const response = await model.deleteMany({
      _id: { $in: mockDocuments.map(d => d._id) }
    });
    expect(response.ok).toBeTruthy();
  });
});
