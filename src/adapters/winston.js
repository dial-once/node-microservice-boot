const assert = require('assert');
const packMessage = require('../utils/message-formatter');

class Winston {
  constructor(loggerChain) {
    assert(loggerChain);
    this.loggerChain = loggerChain;
    const loggingLevels = ['error', 'warn', 'info', 'debug', 'silly', 'verbose'];
    for (const loggingLevel of loggingLevels) {
      this[loggingLevel] = (...args) => {
        loggerChain.log(packMessage(loggingLevel, args));
      };
    }
  }

  log(...args) {
    if (!args[0]) return;
    const params = args[0];
    this.loggerChain.log(params[0], [params.slice(1)]);
  }

  profile(time) {
    const winston = this.loggerChain.consoleChainLink.winston;
    if (time) {
      return winston.profile(time);
    }
    return winston.profile();
  }
}

module.exports = Winston;
