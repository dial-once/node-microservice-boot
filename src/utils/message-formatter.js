/**
  @module with utilities for chain links
**/

/**
  @function packMessage
  Convert the given parameters into a frozen (@see Object.freeze()) message package
  @param level {string} - a message log level (@see ChainLink @class for additional info)
  @param msg {Object|Error} - a message payload. Either a text string or an Error object
  @param metas {Object} - metadata
  @return {Object} - frozen message package object
**/
function packMessage(level, msg, ...metas) {
  level = level || process.env.DEFAULT_LOG_LEVEL || 'info'; //eslint-disable-line
  // if plain text
  const message = {
    level,
    text: msg,
    meta: {
      instanceId: process.env.HOSTNAME,
      notify: true
    }
  };

  // if error
  if (msg instanceof Error) {
    Object.assign(message, {
      text: msg.message || 'Error: ',
      meta: {
        stack: msg.stack,
        notify: true,
        instanceId: process.env.HOSTNAME
      }
    });
  }
  // all metas are included as message meta
  if (metas.length > 0) {
    const metaData = metas.reduce((sum, next) => Object.assign(sum, next));
    Object.assign(message.meta, metaData);
  }
  return Object.freeze(message);
}

/**
  @function getPrefix
  Create a prefix for a message based on which prefix data is enabled for logging
  Configuration with environment variables only:
  - LOG_TIMESTAMP {'true'|'false'} - include timestamp ISO string into a message prefix
  - LOG_ENVIRONMENT {'true'|'false'} - include current environment into a message prefix
  - LOG_LEVEL {'true'|'false'} - include log level in UPPERCASE into a message prefix
  - LOG_REQID {'true'|'false'} - incldue a reqId into a messae prefix

  reqId will be included only if provided in the message meta

  @param message {Object} - message package object
  @param settings {Object} - chain settings. Fallsa back to {} if not given
  @return {string} - Prefix for the log message. Or an empty string of no prefix data logging is enabled
**/
function getPrefix(message, settings = {}) {
  const boolean = ['true', 'false'];
  const includeTimestamp = boolean.includes(process.env.LOG_TIMESTAMP) ?
    process.env.LOG_TIMESTAMP === 'true' : !!settings.LOG_TIMESTAMP;
  const includeEnvironment = boolean.includes(process.env.LOG_ENVIRONMENT) ?
    process.env.LOG_ENVIRONMENT === 'true' : !!settings.LOG_ENVIRONMENT;
  const includeLogLevel = boolean.includes(process.env.LOG_LEVEL) ?
    process.env.LOG_LEVEL === 'true' : !!settings.LOG_LEVEL;
  let prefix = '';
  prefix += includeTimestamp ? `${new Date().toISOString()}:` : '';
  prefix += includeEnvironment ? `${process.env.NODE_ENV || 'local'}:` : '';
  prefix += includeLogLevel ? `${message.level.toUpperCase()}:` : '';
  if (message.meta.reqId) {
    const includeReqId = boolean.includes(process.env.LOG_REQID) ?
      process.env.LOG_REQID === 'true' : !!settings.LOG_REQID;
    prefix += includeReqId ? `${message.meta.reqId}` : '';
  }
  return prefix ? `[${prefix}] ` : '';
}


module.exports = {
  packMessage,
  getPrefix
};
