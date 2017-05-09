const assert = require('assert');
const format = require('../src/utils/message-formatter');

describe('Message formatter ', () => {
  describe('packMessage() ', () => {
    after(() => {
      delete process.env.DEFAULT_LOG_LEVEL;
    });

    it('should expose its functions', () => {
      assert.equal(typeof format, 'object');
      assert.equal(typeof format.packMessage, 'function');
      assert.equal(typeof format.getPrefix, 'function');
    });

    it('should convert null message to default', () => {
      const message = format.packMessage(null, null);
      assert(message);
      assert.equal(message.level, 'info');
      assert.equal(message.text, null);
      assert.equal(message.meta.instanceId, process.env.HOSTNAME);
    });

    it('should convert undefined message to default', () => {
      const message = format.packMessage(undefined, undefined);
      assert(message);
      assert.equal(message.level, 'info');
      assert.equal(message.text, null);
      assert.equal(message.meta.instanceId, process.env.HOSTNAME);
    });

    it('should process message text [string]', () => {
      const message = format.packMessage(null, 'Hello world');
      assert(message);
      assert.equal(message.level, 'info');
      assert.equal(message.text, 'Hello world');
      assert.equal(message.meta.instanceId, process.env.HOSTNAME);
    });

    it('should process message as error [Error]', () => {
      const error = new Error('Hell world');
      const message = format.packMessage(null, error);
      assert(message);
      assert.equal(message.level, 'info');
      assert.equal(message.text, error.message);
      assert.equal(message.meta.stack, error.stack);
      assert.equal(message.meta.notify, true);
      assert.equal(message.meta.instanceId, process.env.HOSTNAME);
    });

    it('should set log level to default if non given [env]', () => {
      process.env.DEFAULT_LOG_LEVEL = 'error';
      const message = format.packMessage(null, 'Hello world');
      assert(message);
      assert.equal(message.level, process.env.DEFAULT_LOG_LEVEL);
    });

    it('should set log level to given', () => {
      const message = format.packMessage('silly', 'Hello world');
      assert(message);
      assert.equal(message.level, 'silly');
    });

    it('should overwrite existing metas with given [string]', () => {
      const message = format.packMessage(null, 'Hello world', { extra: 'data' });
      assert(message);
      assert.equal(message.meta.extra, 'data');
    });

    it('should overwrite existing metas with given [error]', () => {
      const error = new Error('Hell world');
      const message = format.packMessage(null, error, { notify: false }, { something: 'else' });
      assert(message);
      assert.equal(message.meta.notify, false);
      assert.equal(message.meta.something, 'else');
    });
  });

  describe('getPrefix() ', () => {
    afterEach(() => {
      delete process.env.LOG_TIMESTAMP;
      delete process.env.LOG_ENVIRONMENT;
      delete process.env.LOG_LEVEL;
      delete process.env.LOG_REQID;
    });

    it('should return empty string if no envs provided', () => {
      const message = format.packMessage();
      const prefix = format.getPrefix(message);
      assert.equal(prefix, '');
    });

    it('should return data according to settings [no env] [timestamp]', () => {
      const message = format.packMessage();
      const prefix = format.getPrefix(message, { LOG_TIMESTAMP: true });
      assert.notEqual(prefix, '');
    });

    it('should return data according to settings [no env] [environment]', () => {
      const message = format.packMessage();
      const prefix = format.getPrefix(message, { LOG_ENVIRONMENT: true });
      assert.equal(prefix, `[${process.env.NODE_ENV || 'local'}:] `);
    });

    it('should return data according to settings [no env] [log level]', () => {
      const message = format.packMessage();
      const prefix = format.getPrefix(message, { LOG_LEVEL: true });
      assert.equal(prefix, '[INFO:] ');
    });

    it('should return data according to settings [no env] [reqId] [not provided]', () => {
      const message = format.packMessage();
      const prefix = format.getPrefix(message, { LOG_REQID: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [no env] [reqId] [provided]', () => {
      const message = format.packMessage(null, 'Hello world', { reqId: 'test' });
      const prefix = format.getPrefix(message, { LOG_REQID: true });
      assert.equal(prefix, '[test] ');
    });

    it('should return data according to settings [with env]timestamp]', () => {
      const message = format.packMessage();
      process.env.LOG_TIMESTAMP = false;
      const prefix = format.getPrefix(message, { LOG_TIMESTAMP: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env]timestamp]', () => {
      const message = format.packMessage();
      process.env.LOG_TIMESTAMP = true;
      const prefix = format.getPrefix(message, { LOG_TIMESTAMP: false });
      assert.notEqual(prefix, '');
    });

    it('should return data according to settings [with env] [environment]', () => {
      const message = format.packMessage();
      process.env.LOG_ENVIRONMENT = false;
      const prefix = format.getPrefix(message, { LOG_ENVIRONMENT: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [environment]', () => {
      const message = format.packMessage();
      process.env.LOG_ENVIRONMENT = true;
      const prefix = format.getPrefix(message, { LOG_ENVIRONMENT: false });
      assert.equal(prefix, `[${process.env.NODE_ENV || 'local'}:] `);
    });

    it('should return data according to settings [with env] [log level]', () => {
      const message = format.packMessage();
      process.env.LOG_LEVEL = false;
      const prefix = format.getPrefix(message, { LOG_LEVEL: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [log level]', () => {
      const message = format.packMessage();
      process.env.LOG_LEVEL = true;
      const prefix = format.getPrefix(message, { LOG_LEVEL: false });
      assert.equal(prefix, '[INFO:] ');
    });

    it('should return data according to settings [with env] [reqId] [not provided]', () => {
      const message = format.packMessage();
      process.env.LOG_REQID = false;
      const prefix = format.getPrefix(message, { LOG_REQID: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [reqId] [not provided]', () => {
      const message = format.packMessage();
      process.env.LOG_REQID = true;
      const prefix = format.getPrefix(message, { LOG_REQID: false });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [reqId] [provided]', () => {
      const message = format.packMessage(null, 'Hello world', { reqId: 'test' });
      process.env.LOG_REQID = false;
      const prefix = format.getPrefix(message, { LOG_REQID: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [reqId] [provided]', () => {
      const message = format.packMessage(null, 'Hello world', { reqId: 'test' });
      process.env.LOG_REQID = true;
      const prefix = format.getPrefix(message, { LOG_REQID: false });
      assert.equal(prefix, '[test] ');
    });
  });
});
