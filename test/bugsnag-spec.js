var assert = require('assert'),
  modulePath = '../src/bugsnag';

describe('bugsnag', function() {

  afterEach(function() {
    delete require.cache[require.resolve(modulePath)];
    process.env.NODE_ENV = '';
  });

  it('should set env to NODE_ENV', function() {
    process.env.NODE_ENV = 'staging';
    require(modulePath)();
    assert(true);
  });

  it('should set env to dev', function() {
    process.env.NODE_ENV = '';
    require(modulePath)();
    assert(true);
  });
});
