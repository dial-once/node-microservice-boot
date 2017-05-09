const assert = require('assert');
const sinon = require('sinon');
const BugsnagLink = require('../../src/chainLinks/bugsnag-link');
const ChainLink = require('../../src/chainLinks/chain-link');
const format = require('../../src/utils/message-formatter');

describe('Bugsnag chain link ', () => {
  beforeEach(() => {
    this.consoleWarn = console.warn;
  });

  afterEach(() => {
    console.warn = this.consoleWarn;
    delete process.env.BUGSNAG_LOGGING;
    delete process.env.MIN_LOG_LEVEL;
    delete process.env.MIN_LOG_LEVEL_BUGSNAG;
  });

  it('should not throw if no settings are given', () => {
    assert(typeof BugsnagLink, 'function');
    const bugsnag = new BugsnagLink();
    assert.equal(bugsnag.notifier, undefined);
  });

  it('should expose its main functions', () => {
    const bugsnag = new BugsnagLink({}, null);
    assert(typeof bugsnag, 'object');
    assert(bugsnag instanceof ChainLink);
    assert(typeof bugsnag.isReady, 'function');
    assert(typeof bugsnag.willBeUsed, 'function');
    assert(typeof bugsnag.handle, 'function');
  });

  it('should print out a warning if no token provided', (done) => {
    console.warn = (message) => {
      assert.equal(message, 'Bugsnag logging was not initialized due to a missing token');
      done();
    };
    const bugsnag = new BugsnagLink({}, null);
    assert.equal(bugsnag.notifier, undefined);
  });

  it('should initialize with a token', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000' });
    assert.notEqual(bugsnag.notifier, undefined);
  });

  it('should return true/false if initialized/not initialized', () => {
    const bugsnag = new BugsnagLink({}, null);
    assert.equal(bugsnag.isReady(), false);
  });

  it('should indicate if it is switched on/off [settings]', () => {
    let bugsnag = new BugsnagLink({ BUGSNAG_LOGGING: true });
    assert.equal(bugsnag.willBeUsed(), true);
    bugsnag = new BugsnagLink({ BUGSNAG_LOGGING: false });
    assert.equal(bugsnag.willBeUsed(), false);
    bugsnag = new BugsnagLink({});
    assert.equal(bugsnag.willBeUsed(), false);
  });

  it('should indicate if it is switched on/off [envs]', () => {
    const bugsnag = new BugsnagLink({});
    assert.equal(bugsnag.willBeUsed(), false);
    process.env.BUGSNAG_LOGGING = true;
    assert.equal(bugsnag.willBeUsed(), true);
    process.env.BUGSNAG_LOGGING = false;
    assert.equal(bugsnag.willBeUsed(), false);
  });

  it('should indicate if it is switched on/off [envs should have more privilege]', () => {
    const bugsnag = new BugsnagLink({ BUGSNAG_LOGGING: true });
    assert.equal(bugsnag.willBeUsed(), true);
    process.env.BUGSNAG_LOGGING = false;
    assert.equal(bugsnag.willBeUsed(), false);
    process.env.BUGSNAG_LOGGING = undefined;
    assert.equal(bugsnag.willBeUsed(), true);
  });

  it('should not break down if null is notified', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000', BUGSNAG_LOGGING: 'true' });
    bugsnag.handle(null);
  });

  it('should notify message if BUGSNAG_LOGGING = true', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000', BUGSNAG_LOGGING: 'true' });
    const spy = sinon.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = format.packMessage();
    bugsnag.handle(message);
    assert(spy.called);
  });

  it('should not notify message if BUGSNAG_LOGGING = false', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000', BUGSNAG_LOGGING: 'false' });
    const spy = sinon.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = format.packMessage();
    bugsnag.handle(message);
    assert(spy.called);
  });

  it('should not notify if message level < MIN_LOG_LEVEL [settings]', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: 'true',
      MIN_LOG_LEVEL: 'error'
    });
    const spy = sinon.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = format.packMessage();
    bugsnag.handle(message);
    assert(!spy.called);
  });

  it('should not notify if message level < MIN_LOG_LEVEL [envs]', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: 'true'
    });
    const spy = sinon.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = format.packMessage();
    process.env.MIN_LOG_LEVEL = 'error';
    bugsnag.handle(message);
    assert(!spy.called);
  });

  it('should notify if message level >= MIN_LOG_LEVEL_BUGSNAG but < MIN_LOG_LEVEL [envs]', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: 'true'
    });
    const spy = sinon.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = format.packMessage();
    message.level = 'warn';
    process.env.MIN_LOG_LEVEL = 'error';
    process.env.MIN_LOG_LEVEL_BUGSNAG = 'warn';
    bugsnag.handle(message);
    assert(spy.called);
  });

  it('should notify if message level = MIN_LOG_LEVEL [envs]', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: 'true'
    });
    const spy = sinon.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = format.packMessage();
    message.level = 'error';
    process.env.MIN_LOG_LEVEL = 'error';
    bugsnag.handle(message);
    assert(spy.called);
  });

  it('should notify if message level > MIN_LOG_LEVEL [envs]', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: 'true'
    });
    const spy = sinon.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = format.packMessage();
    message.level = 'error';
    process.env.MIN_LOG_LEVEL = 'warn';
    bugsnag.handle(message);
    assert(spy.called);
  });
});
