const ChainLink = require('./chain-link');
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
      if (this.levels[messageLevel] >= this.levels[minLogLevel]) {
        this.winston.log(messageLevel, `${message.meta.scope || ''}${message.text}`, message.meta);
      }
    }
    this.next(message);
  }
}

module.exports = ConsoleLink;
