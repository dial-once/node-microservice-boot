require('le_node');
const ChainLink = require('./chain-link');
const winston = require('winston');

class LogentriesLink extends ChainLink {
  constructor(settings, nextChainLink) {
    super(settings, nextChainLink);
    if (this.settings.LOGS_TOKEN) {
      this.token = this.settings.LOGS_TOKEN;
      this.winston = new winston.Logger();
      this.chain = 'LOGENTRIES';

      this.winston.rewriters.push((level, msg, meta) => {
        const metadata = Object.assign({}, meta);
        delete metadata.notify;
        return metadata;
      });
      this.loggers = {
        [this.token]: this.winston.add(winston.transports.Logentries, { token: this.token })
      };
    } else {
      console.warn('Logentries logging was not initialized due to a missing token');
    }
  }

  isReady() {
    return !!this.winston;
  }

  willBeUsed() {
    return ['true', 'false'].includes(process.env.LOGENTRIES_LOGGING) ?
      process.env.LOGENTRIES_LOGGING === 'true' : !!this.settings.LOGENTRIES_LOGGING;
  }

  handle(message) {
    if (this.isReady() && this.willBeUsed()) {
      const messageLevel = this.levels.has(message.level) ? message.level : this.levels.get('default');
      const minLogLevel = this.getMinLogLevel(this.chain);
      if (this.levels[message.level] >= this.levels[minLogLevel]) {
        this.winston.log(messageLevel, `${message.meta.scope || ''}${message.text}`, message.meta);
      }
    }
    this.next(message);
  }
}

module.exports = LogentriesLink;
