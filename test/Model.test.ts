import Model from '../lib/Model';
import setup from './setup';

const monglow = setup();

test('creates a monglow model', async () => {
  expect(monglow.model('test')).toBeInstanceOf(Model);
});

test('find with monglow model', async () => {
  const model = monglow.model('test');
  await expect(model.find().exec({ hello: 'world' })).resolves.toBeTruthy();
})