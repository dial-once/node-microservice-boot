const assert = require('assert');

const modulePath = '../src/index';

/* eslint-disable global-require, import/no-dynamic-require, no-console */
describe('entry point', () => {
  beforeEach(() => {
    delete require.cache[require.resolve(modulePath)];
    this.consoleKeep = console.error;
  });

  afterEach(() => {
    delete require.cache[require.resolve(modulePath)];
    console.error = this.consoleKeep;
  });

  it('should return a function', () => {
    assert(typeof require(modulePath), 'function');
  });

  it('should execute without an exception (no params) but print a warning message', (done) => {
    console.error = (e) => {
      assert.equal(e, 'Dial Once boot module should be initilised before used without config.');
      done();
    };
    require(modulePath)();
  });

  it('should execute without an exception (params)', () => {
    require(modulePath)({});
  });

  it('should return a logger and a notifier', () => {
    const index = require(modulePath)({});
    assert.notEqual(index.notifier, undefined);
    assert.notEqual(index.logger, undefined);
  });

  it('should return a logger and a notifier (no params) without warning, already initialised', (done) => {
    const index = require('../src/index')();

    console.error = done;
    assert.notEqual(index.notifier, undefined);
    assert.notEqual(index.logger, undefined);
    done();
  });
});
