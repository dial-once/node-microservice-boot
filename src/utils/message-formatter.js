function packMessage(level, msg, ...metas) {
  level = level || process.env.DEFAULT_LOG_LEVEL || 'info'; //eslint-disable-line
  // if plain text
  const message = {
    level,
    text: msg,
    meta: {
      instanceId: process.env.HOSTNAME
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
  // all args with index [1+] are included as message meta
  if (metas.length > 0) {
    const metaData = metas.reduce((sum, next) => Object.assign(sum, next));
    Object.assign(message.meta, metaData);
  }
  return message;
}

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
