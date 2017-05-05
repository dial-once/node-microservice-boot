module.exports = (level = (process.env.DEFAULT_LOG_LEVEL || 'info'), ...args) => {
  const restArgs = args[0] || '';
  // if plain text
  const message = {
    level,
    text: restArgs[0],
    meta: {
      instanceId: process.env.HOSTNAME
    }
  };

  // if error
  if (restArgs[0] instanceof Error) {
    Object.assign(message, {
      text: restArgs[0].message || 'Error: ',
      meta: {
        stack: restArgs[0].stack,
        notify: restArgs[1] ? restArgs[1].notify : true
      }
    });
  }
  // if more than 1 arg, then all args with index [1+] are included as message meta
  if (restArgs.length > 1) {
    const metaArgs = restArgs.slice(1).reduce((sum, next) => Object.assign(sum, next));
    if (metaArgs.scope) {
      metaArgs.scope = `[${metaArgs.scope}] `;
    }
    Object.assign(message.meta, metaArgs);
  }
  return message;
};
