const assert = require('assert');

class Winston {
  constructor(loggerChain) {
    assert(loggerChain);
    this.loggerChain = loggerChain;
    const loggingLevels = ['error', 'warn', 'info', 'debug', 'silly', 'verbose'];
    for (const loggingLevel of loggingLevels) {
      this[loggingLevel] = (message, ...args) => {
        this.loggerChain.log(loggingLevel, message, args);
      };
    }
  }

  log(logLevel, message, ...args) {
    this.loggerChain.log(logLevel, message, args);
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
