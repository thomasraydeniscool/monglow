import Model from '../lib/Model';
import setup from './setup';

const monglow = setup();

const hasDefaults = (el: any) => el.hello != null;

test('create a Monglow model', async () => {
  expect.assertions(2);
  expect(monglow.model('test')).toBeInstanceOf(Model);
  expect(new Model('test')).toBeInstanceOf(Model);
});

test('find query', async () => {
  expect.assertions(1);
  const model = monglow.model('test');
  await expect(model.find().exec()).resolves.toBeArray();
});

test('find query with defaults', async () => {
  expect.assertions(1);
  const model = monglow.model('test');
  await expect(model.find().exec({ hello: 'world' })).resolves.toSatisfyAll(
    hasDefaults
  );
});

test('findOne query', async () => {
  expect.assertions(1);
  const model = monglow.model('test');
  await expect(model.findOne({ name: 'tom' }).exec()).resolves.toHaveProperty(
    'name',
    'tom'
  );
});

test('findOne query with defaults', async () => {
  expect.assertions(1);
  const model = monglow.model('test');
  await expect(
    model.findOne({ hello: { $exists: false } }).exec({ hello: 'world' })
  ).resolves.toHaveProperty('hello', 'world');
});
