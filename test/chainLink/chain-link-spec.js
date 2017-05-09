const assert = require('assert');
const sinon = require('sinon');
const ChainLink = require('../../src/chainLinks/chain-link');

describe('Chain link ', () => {
  after(() => {
    delete process.env.MIN_LOG_LEVEL;
  });

  it('should expose its main functions', () => {
    assert.equal(typeof ChainLink, 'function');
    const chainLink = new ChainLink({}, null);
    assert.equal(typeof chainLink, 'object');
    assert.equal(chainLink.nextLink, null);
    assert.deepEqual(chainLink.settings, {});
    assert(chainLink.logLevels instanceof Map);
    assert.equal(typeof chainLink.getMinLogLevel, 'function');
    assert.equal(typeof chainLink.next, 'function');
    assert.equal(typeof chainLink.link, 'function');
    assert.equal(typeof chainLink.isReady, 'function');
    assert.equal(typeof chainLink.willBeUsed, 'function');
    assert.equal(typeof chainLink.handle, 'function');
  });

  it('should return info as default min log level if not given in config / env', () => {
    const chainLink = new ChainLink({}, null);
    const minLogLevel = chainLink.getMinLogLevel();
    assert.equal(minLogLevel, 'info');
  });

  it('should return min log level from settings [no env]', () => {
    const chainLink = new ChainLink({ MIN_LOG_LEVEL: 'error' }, null);
    const minLogLevel = chainLink.getMinLogLevel();
    assert.equal(minLogLevel, 'error');
  });

  it('should return min log level from env [no settings]', () => {
    process.env.MIN_LOG_LEVEL = 'warn';
    const chainLink = new ChainLink({}, null);
    const minLogLevel = chainLink.getMinLogLevel();
    assert.equal(minLogLevel, 'warn');
  });

  it('should return min log level from env [env and settings]', () => {
    process.env.MIN_LOG_LEVEL = 'warn';
    const chainLink = new ChainLink({ MIN_LOG_LEVEL: 'error' }, null);
    const minLogLevel = chainLink.getMinLogLevel();
    assert.equal(minLogLevel, 'warn');
  });

  it('should return default log level if typo was done', () => {
    process.env.MIN_LOG_LEVEL = 'weird';
    const chainLink = new ChainLink({ MIN_LOG_LEVEL: 'error' }, null);
    const minLogLevel = chainLink.getMinLogLevel();
    assert.equal(minLogLevel, 'info');
  });

  it('should not throw if next link does not exist', () => {
    const chainLink = new ChainLink({}, null);
    chainLink.next();
  });

  it('should go to next link if exists', () => {
    const spy = sinon.spy(sinon.stub());
    const chainLink = new ChainLink({}, { handle: spy });
    chainLink.next();
    assert(spy.called);
  });

  it('should link a new chainLink', () => {
    const chainLink = new ChainLink({}, null);
    const spy = sinon.spy(sinon.stub());
    const mock = {
      handle: spy
    };
    assert.equal(chainLink.nextLink, null);
    chainLink.link(mock);
    assert.equal(typeof chainLink.nextLink, 'object');
    chainLink.next();
    assert(spy.called);
  });
});
