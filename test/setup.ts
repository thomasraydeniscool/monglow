import Monglow from '../lib/Monglow';

const setup = () => {
  const monglow = new Monglow('mongodb://localhost:27017/test');

  beforeAll(async () => {
    await monglow.connect();
  });

  afterAll(async () => {
    await monglow.disconnect();
  });

  return monglow;
};

export default setup;
