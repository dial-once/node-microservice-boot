const Message = require('../modules/message');
/**
  @module with utilities for chain links
**/

/**
  @function getPrefix
  Create a prefix for a message based on which prefix data is enabled for logging
  Configuration with environment variables only:
  - LOG_TIMESTAMP {'true'|'false'} - include timestamp ISO string into a message prefix
  - LOG_ENVIRONMENT {'true'|'false'} - include current environment into a message prefix
  - LOG_LEVEL {'true'|'false'} - include log level in UPPERCASE into a message prefix
  - LOG_REQID {'true'|'false'} - incldue a reqId into a messae prefix

  reqId will be included only if provided in the message meta

  @param data {Message|Object} - message package object
  @param settings {Object} - chain settings. Fallsa back to {} if not given
  @return {string} - Prefix for the log message. Or an empty string of no prefix data logging is enabled
**/
function getPrefix(data, settings = {}) {
  const message = data instanceof Message ? data.payload : data;
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
  getPrefix
};
