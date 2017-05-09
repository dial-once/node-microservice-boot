const assert = require('assert');
const sinon = require('sinon');
const LogentriesLink = require('../../src/chainLinks/logentries-link');
const ChainLink = require('../../src/chainLinks/chain-link');
const format = require('../../src/utils/message-formatter');

describe('Bugsnag chain link ', () => {
  beforeEach(() => {
    this.consoleWarn = console.warn;
  });

  afterEach(() => {
    console.warn = this.consoleWarn;
    delete process.env.LOGENTRIES_LOGGING;
    delete process.env.MIN_LOG_LEVEL;
    delete process.env.MIN_LOG_LEVEL_LOGENTRIES;
  });

  it('should not throw if no settings are given', () => {
    assert(typeof BugsnagLink, 'function');
    const logentries = new LogentriesLink();
    assert.equal(logentries.winston, undefined);
  });

  it('should expose its main functions', () => {
    const logentries = new LogentriesLink({}, null);
    assert(typeof logentries, 'object');
    assert(logentries instanceof ChainLink);
    assert(typeof logentries.isReady, 'function');
    assert(typeof logentries.willBeUsed, 'function');
    assert(typeof logentries.handle, 'function');
  });

  it('should print out a warning if no token provided', (done) => {
    console.warn = (message) => {
      assert.equal(message, 'Logentries logging was not initialized due to a missing token');
      done();
    };
    const logentries = new LogentriesLink({}, null);
    assert.equal(logentries.winston, undefined);
  });

  it('should initialize with a token', () => {
    const logentries = new LogentriesLink({ LOGS_TOKEN: '00000000-0000-0000-0000-000000000000' });
    assert.notEqual(logentries.winston, undefined);
  });

  it('should return true/false if initialized/not initialized', () => {
    const logentries = new LogentriesLink({}, null);
    assert.equal(logentries.isReady(), false);
  });

  it('should indicate if it is switched on/off [settings]', () => {
    let logentries = new LogentriesLink({ LOGENTRIES_LOGGING: true });
    assert.equal(logentries.willBeUsed(), true);
    logentries = new LogentriesLink({ LOGENTRIES_LOGGING: false });
    assert.equal(logentries.willBeUsed(), false);
    logentries = new LogentriesLink({});
    assert.equal(logentries.willBeUsed(), false);
  });

  it('should indicate if it is switched on/off [envs]', () => {
    const logentries = new LogentriesLink({});
    assert.equal(logentries.willBeUsed(), false);
    process.env.LOGENTRIES_LOGGING = true;
    assert.equal(logentries.willBeUsed(), true);
    process.env.LOGENTRIES_LOGGING = false;
    assert.equal(logentries.willBeUsed(), false);
  });

  it('should indicate if it is switched on/off [envs should have more privilege]', () => {
    const logentries = new LogentriesLink({ LOGENTRIES_LOGGING: true });
    assert.equal(logentries.willBeUsed(), true);
    process.env.LOGENTRIES_LOGGING = false;
    assert.equal(logentries.willBeUsed(), false);
    process.env.LOGENTRIES_LOGGING = undefined;
    assert.equal(logentries.willBeUsed(), true);
  });

  it('should not break down if null is notified', () => {
    const logentries = new LogentriesLink({
      LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      LOGENTRIES_LOGGING: 'true'
    });
    logentries.handle(null);
  });

  it('should log message if LOGENTRIES_LOGGING = true', () => {
    const logentries = new LogentriesLink({
      LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      LOGENTRIES_LOGGING: 'true'
    });
    const spy = sinon.spy(logentries.winston.log);
    logentries.winston.log = spy;
    const message = format.packMessage();
    logentries.handle(message);
    assert(spy.called);
  });

  it('should not log message if LOGENTRIES_LOGGING = false', () => {
    const logentries = new LogentriesLink({
      LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      LOGENTRIES_LOGGING: 'false'
    });
    const spy = sinon.spy(logentries.winston.log);
    logentries.winston.log = spy;
    const message = format.packMessage();
    logentries.handle(message);
    assert(spy.called);
  });

  it('should not log if message level < MIN_LOG_LEVEL [settings]', () => {
    const logentries = new LogentriesLink({
      LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      LOGENTRIES_LOGGING: 'true',
      MIN_LOG_LEVEL: 'error'
    });
    const spy = sinon.spy(logentries.winston.log);
    logentries.winston.log = spy;
    const message = format.packMessage();
    logentries.handle(message);
    assert(!spy.called);
  });

  it('should not log if message level < MIN_LOG_LEVEL [envs]', () => {
    const logentries = new LogentriesLink({
      LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      LOGENTRIES_LOGGING: 'true'
    });
    const spy = sinon.spy(logentries.winston.log);
    logentries.winston.log = spy;
    const message = format.packMessage();
    process.env.MIN_LOG_LEVEL = 'error';
    logentries.handle(message);
    assert(!spy.called);
  });

  it('should not log if message level >= MIN_LOG_LEVEL_LOGENTRIES but < MIN_LOG_LEVEL [envs]', () => {
    const logentries = new LogentriesLink({
      LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      LOGENTRIES_LOGGING: 'true'
    });
    const spy = sinon.spy(logentries.winston.log);
    logentries.winston.log = spy;
    const message = format.packMessage();
    message.level = 'warn';
    process.env.MIN_LOG_LEVEL = 'error';
    process.env.MIN_LOG_LEVEL_LOGENTRIES = 'warn';
    logentries.handle(message);
    assert(spy.called);
  });

  it('should log if message level = MIN_LOG_LEVEL [envs]', () => {
    const logentries = new LogentriesLink({
      LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      LOGENTRIES_LOGGING: 'true'
    });
    const spy = sinon.spy(logentries.winston.log);
    logentries.winston.log = spy;
    const message = format.packMessage();
    message.level = 'error';
    process.env.MIN_LOG_LEVEL = 'error';
    logentries.handle(message);
    assert(spy.called);
  });

  it('should log if message level > MIN_LOG_LEVEL [envs]', () => {
    const logentries = new LogentriesLink({
      LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      LOGENTRIES_LOGGING: 'true'
    });
    const spy = sinon.spy(logentries.winston.log);
    logentries.winston.log = spy;
    const message = format.packMessage();
    message.level = 'error';
    process.env.MIN_LOG_LEVEL = 'warn';
    logentries.handle(message);
    assert(spy.called);
  });
});
