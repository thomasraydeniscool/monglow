import { Monglow } from '../src';

describe('Monglow', () => {
  it('can create Monglow instance', () => {
    expect(new Monglow('localhost/test')).toBeInstanceOf(Monglow);
  });
});
