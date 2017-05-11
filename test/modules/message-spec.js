const assert = require('assert');
const Message = require('../../src/modules/message');

describe('packMessage() ', () => {
  after(() => {
    delete process.env.DEFAULT_LOG_LEVEL;
  });

  it('should convert null message to default', () => {
    const message = new Message(null, null);
    assert(message);
    assert(message.payload);
    assert.equal(message.payload.level, 'info');
    assert.equal(message.payload.text, '');
    assert.equal(message.payload.meta.instanceId, process.env.HOSTNAME);
  });

  it('should convert undefined message to default', () => {
    const message = new Message(undefined, undefined);
    assert(message);
    assert(message.payload);
    assert.equal(message.payload.level, 'info');
    assert.equal(message.payload.text, '');
    assert.equal(message.payload.meta.instanceId, process.env.HOSTNAME);
  });

  it('should process message text [string]', () => {
    const message = new Message(null, 'Hello world');
    assert(message);
    assert(message.payload);
    assert.equal(message.payload.level, 'info');
    assert.equal(message.payload.text, 'Hello world');
    assert.equal(message.payload.meta.instanceId, process.env.HOSTNAME);
  });

  it('should process message as error [Error]', () => {
    const error = new Error('Hell world');
    const message = new Message(null, error);
    assert(message);
    assert(message.payload);
    assert.equal(message.payload.level, 'info');
    assert.equal(message.payload.text, error.message);
    assert.equal(message.payload.meta.stack, error.stack);
    assert.equal(message.payload.meta.notify, true);
    assert.equal(message.payload.meta.instanceId, process.env.HOSTNAME);
  });

  it('should set log level to default if non given [env]', () => {
    process.env.DEFAULT_LOG_LEVEL = 'error';
    const message = new Message(null, 'Hello world');
    assert(message);
    assert(message.payload);
    assert.equal(message.payload.level, process.env.DEFAULT_LOG_LEVEL);
  });

  it('should set log level to given', () => {
    const message = new Message('silly', 'Hello world');
    assert(message);
    assert(message.payload);
    assert.equal(message.payload.level, 'silly');
  });

  it('should overwrite existing metas with given [string]', () => {
    const message = new Message(null, 'Hello world', {
      extra: 'data'
    });
    assert(message);
    assert(message.payload);
    assert.equal(message.payload.meta.extra, 'data');
  });

  it('should overwrite existing metas with given [error]', () => {
    const error = new Error('Hell world');
    const message = new Message(null, error, {
      notify: false
    }, {
      something: 'else'
    });
    assert(message);
    assert(message.payload);
    assert.equal(message.payload.meta.notify, false);
    assert.equal(message.payload.meta.something, 'else');
  });
});
