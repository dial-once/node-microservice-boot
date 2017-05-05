const ChainLink = require('./chain-link');
const { getPrefix } = require('./../utils/message-formatter');
const winston = require('winston');

class ConsoleLink extends ChainLink {
  constructor(settings, nextChainLink) {
    super(settings, nextChainLink);
    this.winston = new winston.Logger();
    this.winston.add(winston.transports.Console);
    this.chain = 'CONSOLE';
  }

  isReady() {
    return !!this.winston;
  }

  willBeUsed() {
    return ['true', 'false'].includes(process.env.CONSOLE_LOGGING) ?
      process.env.CONSOLE_LOGGING === 'true' : !!this.settings.CONSOLE_LOGGING;
  }

  handle(message) {
    // we do not want console transport in production, because it reduce performances
    if (this.isReady() && this.willBeUsed()) {
      const messageLevel = this.levels.has(message.level) ? message.level : this.levels.get('default');
      const minLogLevel = this.getMinLogLevel(this.chain);
      if (this.levels.get(messageLevel) >= this.levels.get(minLogLevel)) {
        const prefix = getPrefix(message, this.settings);
        this.winston.log(messageLevel, `${prefix}${message.text}`, message.meta);
      }
    }
    this.next(message);
  }
}

module.exports = ConsoleLink;
