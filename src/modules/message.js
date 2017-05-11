const deepFreeze = require('deep-freeze');
/**
  @class Message
  Convert the given parameters into a frozen (@see Object.deepFreeze()) message package
  @param logLevel {string} - a message log level (@see ChainLink @class for additional info)
  @param message {Object|Error} - a message payload. Either a text string or an Error object
  @param metas {Object} - metadata
**/
class Message {
  constructor(logLevel, message, ...metas) {
    // if plain text
    this.payload = {
      level: logLevel || process.env.DEFAULT_LOG_LEVEL || 'info',
      text: message || '',
      meta: {
        instanceId: process.env.HOSTNAME,
        notify: true
      }
    };

    // if error
    if (message instanceof Error) {
      this.payload.text = message.message || 'Error: ';
      this.payload.meta.stack = message.stack;
    }
    // all metas are included as message meta
    if (metas.length > 0) {
      const metaData = metas.reduce((sum, next) => Object.assign({}, sum, next));
      Object.assign(this.payload.meta, metaData);
    }
    this.payload = deepFreeze(this.payload);
  }
}

module.exports = Message;
