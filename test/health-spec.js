var assert = require('assert'),
  health = require('../src/health');

describe('health', function() {
  it('should expose a function', function() {
    assert.equal(typeof health, 'function');
  });

  it('should be able to call the function without throwing an error', function() {
    health();
  });
});
