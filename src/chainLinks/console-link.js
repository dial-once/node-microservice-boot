const ChainLink = require('./chain-link');
const { getPrefix } = require('./../utils/message-formatter');
const winston = require('winston');

/**
  @class ConsoleLink
  A console logger chain link
  @implements ChainLink @class - a basic interface for each link based on the Chain of Resp Pattern
  This chain link is responsible for logging a message to the console

  Has the following configurations (either env var or settings param):
  - CONSOLE_LOGGING {'true'|'false'} - switches on / off the use of this chain link
  - MIN_LOG_LEVEL_CONSOLE = {'silly'|'verbose'|'debug'|'info'|'warn'|'error'} - min log level of a message to log
  This config has a higher priority than a global DEFAULT_LOG_LEVEl config
  @see ChainLink @class for info on the log level priorities
  If a message's level is >= than a MIN_LOG_LEVEL_CONSOLE - it will be notified. Otherwise - skipped

  Environment variables have a higher priority over a settings object parameters
**/
class ConsoleLink extends ChainLink {
  /**
    @constructor
    Construct an instance of a ConsoleLink @class
    @param settings {Object} - LoggerChain configuration object
    @param nextChainLink {Object} - Optional parameter. A next object on the chain
  **/
  constructor(settings, nextChainLink) {
    super(nextChainLink, settings);
    this.winston = new winston.Logger();
    this.winston.add(winston.transports.Console);
    this.chain = 'CONSOLE';
  }

  /**
    @function isReady
    Check if a chain link is configured properly and is ready to be used
    @return {boolean}
  **/
  isReady() {
    return !!this.winston;
  }

  /**
    @function willBeUsed
    Check if a chain link will be used
    Depends on configuration env variables / settings object parameters
    Checks CONSOLE_LOGGING env / settings object param
    @return {boolean} - if this chain link is switched on / off
  **/
  willBeUsed() {
    return ['true', 'false'].includes(process.env.CONSOLE_LOGGING) ?
      process.env.CONSOLE_LOGGING === 'true' : !!this.settings.CONSOLE_LOGGING;
  }

  /**
    @function handle
    Process a message and log it if the chain link is switched on and message's log level is >= than MIN_LOG_LEVEL
    Finally, pass the message to the next chain link if any
    @param message {Object} - message package object
    @see LoggerChain message package object structure description

    This function is NOT ALLOWED to modify the message
    This function HAS to invoke the next() @function and pass the message further along the chain
  **/
  handle(message) {
    if (this.isReady() && this.willBeUsed() && message) {
      const messageLevel = this.logLevels.has(message.level) ? message.level : this.logLevels.get('default');
      const minLogLevel = this.getMinLogLevel(this.chain);
      if (this.logLevels.get(messageLevel) >= this.logLevels.get(minLogLevel)) {
        const prefix = getPrefix(message, this.settings);
        this.winston.log(messageLevel, `${prefix}${message.text}`, message.meta);
      }
    }
    this.next(message);
  }
}

module.exports = ConsoleLink;
