const assert = require('assert');
const sinon = require('sinon');
const ConsoleLink = require('../../src/chainLinks/console-link');
const ChainLink = require('../../src/chainLinks/chain-link');
const format = require('../../src/utils/message-formatter');

describe('Console chain link ', () => {
  before(() => {
    delete process.env.BUGSNAG_LOGGING;
    delete process.env.LOGENTRIES_LOGGING;
    delete process.env.MIN_LOG_LEVEL;
    delete process.env.MIN_LOG_LEVEL_CONSOLE;
    delete process.env.MIN_LOG_LEVEL_LOGENTRIES;
    delete process.env.MIN_LOG_LEVEL_BUGSNAG;
    delete process.env.DEFAULT_LOG_LEVEL;
    delete process.env.LOG_TIMESTAMP;
    delete process.env.LOG_ENVIRONMENT;
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_REQID;
  });

  afterEach(() => {
    delete process.env.CONSOLE_LOGGING;
    delete process.env.MIN_LOG_LEVEL;
    delete process.env.MIN_LOG_LEVEL_CONSOLE;
  });

  it('should not throw if no settings are given', () => {
    assert(typeof ConsoleLink, 'function');
    const consoleChain = new ConsoleLink();
    assert.notEqual(consoleChain.winston, undefined);
  });

  it('should expose its main functions', () => {
    const consoleChain = new ConsoleLink({}, null);
    assert(typeof consoleChain, 'object');
    assert(consoleChain instanceof ChainLink);
    assert(typeof consoleChain.isReady, 'function');
    assert(typeof consoleChain.willBeUsed, 'function');
    assert(typeof consoleChain.handle, 'function');
  });

  it('should return true/false if initialized/not initialized', () => {
    const consoleChain = new ConsoleLink();
    assert.equal(consoleChain.isReady(), true);
    delete consoleChain.winston;
    assert.equal(consoleChain.isReady(), false);
  });

  it('should indicate if it is switched on/off [settings]', () => {
    let consoleChain = new ConsoleLink({ CONSOLE_LOGGING: true });
    assert.equal(consoleChain.willBeUsed(), true);
    consoleChain = new ConsoleLink({ CONSOLE_LOGGING: false });
    assert.equal(consoleChain.willBeUsed(), false);
    consoleChain = new ConsoleLink();
    assert.equal(consoleChain.willBeUsed(), false);
  });

  it('should indicate if it is switched on/off [envs]', () => {
    const consoleChain = new ConsoleLink();
    assert.equal(consoleChain.willBeUsed(), false);
    process.env.CONSOLE_LOGGING = true;
    assert.equal(consoleChain.willBeUsed(), true);
    process.env.CONSOLE_LOGGING = false;
    assert.equal(consoleChain.willBeUsed(), false);
  });

  it('should indicate if it is switched on/off [envs should have more privilege]', () => {
    const consoleChain = new ConsoleLink({ CONSOLE_LOGGING: true });
    assert.equal(consoleChain.willBeUsed(), true);
    process.env.CONSOLE_LOGGING = false;
    assert.equal(consoleChain.willBeUsed(), false);
    process.env.CONSOLE_LOGGING = undefined;
    assert.equal(consoleChain.willBeUsed(), true);
  });

  it('should not break down if null is logged', () => {
    const consoleChain = new ConsoleLink({ CONSOLE_LOGGING: 'true' });
    consoleChain.handle(null);
  });

  it('should log message if CONSOLE_LOGGING = true', () => {
    const consoleChain = new ConsoleLink({ CONSOLE_LOGGING: 'true' });
    const spy = sinon.spy(consoleChain.winston.log);
    consoleChain.winston.log = spy;
    const message = format.packMessage();
    consoleChain.handle(message);
    assert(spy.called);
  });

  it('should not log message if CONSOLE_LOGGING = false', () => {
    const consoleChain = new ConsoleLink({ CONSOLE_LOGGING: 'false' });
    const spy = sinon.spy(consoleChain.winston.log);
    consoleChain.winston.log = spy;
    const message = format.packMessage();
    consoleChain.handle(message);
    assert(spy.called);
  });

  it('should not log if message level < MIN_LOG_LEVEL [settings]', () => {
    const consoleChain = new ConsoleLink({
      CONSOLE_LOGGING: 'true',
      MIN_LOG_LEVEL: 'error'
    });
    const spy = sinon.spy(consoleChain.winston.log);
    consoleChain.winston.log = spy;
    const message = format.packMessage();
    consoleChain.handle(message);
    assert(!spy.called);
  });

  it('should not log if message level < MIN_LOG_LEVEL [envs]', () => {
    const consoleChain = new ConsoleLink({ CONSOLE_LOGGING: 'true' });
    const spy = sinon.spy(consoleChain.winston.log);
    consoleChain.winston.log = spy;
    const message = format.packMessage();
    process.env.MIN_LOG_LEVEL = 'error';
    consoleChain.handle(message);
    assert(!spy.called);
  });

  it('should log if message level >= MIN_LOG_LEVEL_CONSOLE but < MIN_LOG_LEVEL [envs]', () => {
    const consoleChain = new ConsoleLink({ CONSOLE_LOGGING: 'true' });
    const spy = sinon.spy(consoleChain.winston.log);
    consoleChain.winston.log = spy;
    const message = format.packMessage('warn');
    process.env.MIN_LOG_LEVEL = 'error';
    process.env.MIN_LOG_LEVEL_CONSOLE = 'warn';
    consoleChain.handle(message);
    assert(spy.called);
  });

  it('should log if message level = MIN_LOG_LEVEL [envs]', () => {
    const consoleChain = new ConsoleLink({ CONSOLE_LOGGING: 'true' });
    const spy = sinon.spy(consoleChain.winston.log);
    consoleChain.winston.log = spy;
    const message = format.packMessage('error');
    process.env.MIN_LOG_LEVEL = 'error';
    consoleChain.handle(message);
    assert(spy.called);
  });

  it('should log if message level > MIN_LOG_LEVEL [envs]', () => {
    const consoleChain = new ConsoleLink({ CONSOLE_LOGGING: 'true' });
    const spy = sinon.spy(consoleChain.winston.log);
    consoleChain.winston.log = spy;
    const message = format.packMessage('error');
    process.env.MIN_LOG_LEVEL = 'warn';
    consoleChain.handle(message);
    assert(spy.called);
  });
});
