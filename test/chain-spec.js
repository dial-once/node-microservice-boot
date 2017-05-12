const modulePath = './../src/index';
const loggerModule = require('./../src/index');
const assert = require('assert');

describe('Logger chain ', () => {
  before(() => {
    assert.equal(typeof loggerModule, 'function');
  });

  beforeEach(() => {
    delete require.cache[require.resolve(modulePath)];
  });

  it('should initialize when undefined config is given ', () => {
    const loggerInstance = loggerModule(undefined);
    assert(loggerInstance);
    const chain = loggerInstance.chain;
    assert.equal(typeof chain, 'object');
    assert.equal(typeof chain.settings, 'object');
    assert.equal(typeof chain.ChainLink, 'function');
    assert.equal(typeof chain.chainStart, 'object');
    assert.equal(typeof chain.chainEnd, 'object');
    assert.equal(typeof chain.bugsnagChainLink, 'object');
    assert.equal(typeof chain.logentriesChainLink, 'object');
    assert.equal(typeof chain.consoleChainLink, 'object');
    assert.equal(typeof chain.log, 'function');
  });

  it('should initialize when null config is given ', () => {
    const loggerInstance = loggerModule(null);
    assert(loggerInstance);
    const chain = loggerInstance.chain;
    assert.equal(typeof chain, 'object');
    assert.equal(typeof chain.settings, 'object');
    assert.equal(typeof chain.chainStart, 'object');
    assert.equal(typeof chain.ChainLink, 'function');
    assert.equal(typeof chain.chainEnd, 'object');
    assert.equal(typeof chain.bugsnagChainLink, 'object');
    assert.equal(typeof chain.logentriesChainLink, 'object');
    assert.equal(typeof chain.consoleChainLink, 'object');
    assert.equal(typeof chain.log, 'function');
  });

  it('should initialize when empty config is given', () => {
    const loggerInstance = loggerModule({});
    const chain = loggerInstance.chain;
    assert.equal(typeof chain, 'object');
    assert.equal(typeof chain.settings, 'object');
    assert.equal(typeof chain.chainStart, 'object');
    assert.equal(typeof chain.ChainLink, 'function');
    assert.equal(typeof chain.chainEnd, 'object');
    assert.equal(typeof chain.bugsnagChainLink, 'object');
    assert.equal(typeof chain.logentriesChainLink, 'object');
    assert.equal(typeof chain.consoleChainLink, 'object');
    assert.equal(typeof chain.log, 'function');
  });

  it('should allow user to reconfigure the module', () => {
    let loggerInstance = loggerModule({ hello: 'world' });
    assert(loggerInstance);
    assert.equal(loggerInstance.chain.settings.hello, 'world');
    loggerInstance = loggerModule({ hello: 'everyone' });
    assert.equal(loggerInstance.chain.settings.hello, 'everyone');
  });

  it('should behave as a singleton if config was not provided', () => {
    let loggerInstance = loggerModule({ hello: 'world' });
    assert(loggerInstance);
    assert.equal(loggerInstance.chain.settings.hello, 'world');
    loggerInstance = loggerModule();
    assert(loggerInstance);
    assert.equal(loggerInstance.chain.settings.hello, 'world');
  });

  it('should not break down if null is logged (console logging is on)', () => {
    const { chain } = loggerModule();
    chain.log(null, null);
  });
});
