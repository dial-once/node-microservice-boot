var assert = require('assert');

describe('entry point', () => {
  it('should return a function', () => {
    assert(typeof require('../src/index'), 'function');
  });

  it('should execute without an exception (no params)', () => {
    require('../src/index')();
  });

  it('should execute without an exception (params)', () => {
    require('../src/index')({});
  });
});
