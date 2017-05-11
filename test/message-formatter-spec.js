const assert = require('assert');
const Message = require('../src/modules/message');
const format = require('../src/utils/message-formatter');

describe('Message formatter ', () => {
  describe('getPrefix() ', () => {
    beforeEach(() => {
      delete process.env.LOG_TIMESTAMP;
      delete process.env.LOG_ENVIRONMENT;
      delete process.env.LOG_LEVEL;
      delete process.env.LOG_REQID;
    });

    afterEach(() => {
      delete process.env.LOG_TIMESTAMP;
      delete process.env.LOG_ENVIRONMENT;
      delete process.env.LOG_LEVEL;
      delete process.env.LOG_REQID;
    });

    it('should return empty string if no envs provided', () => {
      const message = new Message();
      const prefix = format.getPrefix(message);
      assert.equal(prefix, '');
    });

    it('should return data according to settings [no env] [timestamp]', () => {
      const message = new Message();
      const prefix = format.getPrefix(message, { LOG_TIMESTAMP: true });
      assert.notEqual(prefix, '');
    });

    it('should return data according to settings [no env] [environment]', () => {
      const message = new Message();
      const prefix = format.getPrefix(message, { LOG_ENVIRONMENT: true });
      assert.equal(prefix, `[${process.env.NODE_ENV || 'local'}:] `);
    });

    it('should return data according to settings [no env] [log level]', () => {
      const message = new Message();
      const prefix = format.getPrefix(message, { LOG_LEVEL: true });
      assert.equal(prefix, '[INFO:] ');
    });

    it('should return data according to settings [no env] [reqId] [not provided]', () => {
      const message = new Message();
      const prefix = format.getPrefix(message, { LOG_REQID: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [no env] [reqId] [provided]', () => {
      const message = new Message(null, 'Hello world', { reqId: 'test' });
      const prefix = format.getPrefix(message, { LOG_REQID: true });
      assert.equal(prefix, '[test] ');
    });

    it('should return data according to settings [with env]timestamp]', () => {
      const message = new Message();
      process.env.LOG_TIMESTAMP = false;
      const prefix = format.getPrefix(message, { LOG_TIMESTAMP: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env]timestamp]', () => {
      const message = new Message();
      process.env.LOG_TIMESTAMP = true;
      const prefix = format.getPrefix(message, { LOG_TIMESTAMP: false });
      assert.notEqual(prefix, '');
    });

    it('should return data according to settings [with env] [environment]', () => {
      const message = new Message();
      process.env.LOG_ENVIRONMENT = false;
      const prefix = format.getPrefix(message, { LOG_ENVIRONMENT: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [environment]', () => {
      const message = new Message();
      process.env.LOG_ENVIRONMENT = true;
      const prefix = format.getPrefix(message, { LOG_ENVIRONMENT: false });
      assert.equal(prefix, `[${process.env.NODE_ENV || 'local'}:] `);
    });

    it('should return data according to settings [with env] [log level]', () => {
      const message = new Message();
      process.env.LOG_LEVEL = false;
      const prefix = format.getPrefix(message, { LOG_LEVEL: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [log level]', () => {
      const message = new Message();
      process.env.LOG_LEVEL = true;
      const prefix = format.getPrefix(message, { LOG_LEVEL: false });
      assert.equal(prefix, '[INFO:] ');
    });

    it('should return data according to settings [with env] [reqId] [not provided]', () => {
      const message = new Message();
      process.env.LOG_REQID = false;
      const prefix = format.getPrefix(message, { LOG_REQID: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [reqId] [not provided]', () => {
      const message = new Message();
      process.env.LOG_REQID = true;
      const prefix = format.getPrefix(message, { LOG_REQID: false });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [reqId] [provided]', () => {
      const message = new Message(null, 'Hello world', { reqId: 'test' });
      process.env.LOG_REQID = false;
      const prefix = format.getPrefix(message, { LOG_REQID: true });
      assert.equal(prefix, '');
    });

    it('should return data according to settings [with env] [reqId] [provided]', () => {
      const message = new Message(null, 'Hello world', { reqId: 'test' });
      process.env.LOG_REQID = true;
      const prefix = format.getPrefix(message, { LOG_REQID: false });
      assert.equal(prefix, '[test] ');
    });
  });
});
