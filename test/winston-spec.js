var assert = require('assert'),
  modulePath = '../src/winston';

describe('winston transports', function() {
  beforeEach(function() {
    process.env.CONSOLE_LOGGING = '';
    delete require.cache[require.resolve(modulePath)];
    delete require.cache[require.resolve('winston')];
  });

  it('should add logentries and console transports', function() {
    var logger = require(modulePath)('cd9b3367-59d8-44c8-9d8e-096d79286bb4');

    assert.equal(typeof logger.transports.logentries, 'object');
    assert.equal(typeof logger.transports.console, 'object');

    require('winston').info('it works');
  });

  it('should be able to disable console transport', function() {
    process.env.CONSOLE_LOGGING = false;
    var logger = require(modulePath)('');
    assert.equal(typeof logger.transports.console, 'undefined');
    require('winston').info('it works');
  });
});
