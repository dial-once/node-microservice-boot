require('./env');
const Message = require('./modules/message');
const BugsnagChainLink = require('./chainLinks/bugsnag-link');
const ConsoleChainLink = require('./chainLinks/console-link');
const LogentriesChainLink = require('./chainLinks/logentries-link');
const ChainLink = require('./chainLinks/chain-link');
const Bugsnag = require('./adapters/bugsnag');
const Winston = require('./adapters/winston');

let instance;

/**
  @class LoggerChain
  Logging chain. Consists of individual chain links, linked together.
  Executes each chain link separately one after another.

  Exposes chainStart and chanEnd for chain modification outside of the module

  Converts provided parameters into a message package object of the following structure:
  {
    level: {'silly'|'verbose'|'debug'|'info'|'warn'|'error'},
    text: {string},
    meta: {
      instanceId: {string},
      notify: {true}, // by default,
      stack: {string}, // in case message was given to log,
      ... (other metadata provided in runtime)
    }
  }
  Such message package object is frozen, meaning that it can not be modified.
  This is encouraged to make sure each chain link receives identical structure of the message
  @see packMessage @function documentation for detailed implementation

  Chain of Responsibility pattern
  @see http://www.dofactory.com/javascript/chain-of-responsibility-design-pattern
**/
class LoggerChain {
  /**
    @constructor
    @param settings {object} - chain configuration object
    May contain the following parameters:
    - BUGS_TOKEN {string}
    - LOGS_TOKEN {string}
    - MIN_LOG_LEVEL {string}
    - DEFAULT_LOG_LEVEL {string} - falls back to 'info' if not provided
    - MIN_LOG_LEVEL_CONSOLE {string} - higher priority than MIN_LOG_LEVEL
    - MIN_LOG_LEVEL_LOGENTRIES {string} - higher priority than MIN_LOG_LEVEL
    - MIN_LOG_LEVEL_BUGSNAG {string} - higher priority than MIN_LOG_LEVEL
    - CONSOLE_LOGGING {boolean}
    - LOGENTRIES_LOGGING {boolean}
    - BUGSNAG_LOGGING {boolean}
    Note, however, that env variables have higher priorities than these settings

    Instance of a LoggerChain exposes:
    - settings object
    - each chain link
    - chainStart and chainEnd

    New chain can be added in runtime as the following:
    const chainLinkImpl = new ChainLink();
    instance.chainEnd.link(chainLinkImpl);
    instance.chainEnd = chainLinkImpl;
  **/
  constructor(settings) {
    this.settings = settings;
    this.bugsnagChainLink = new BugsnagChainLink(settings, null);
    this.logentriesChainLink = new LogentriesChainLink(settings, this.bugsnagChainLink);
    this.consoleChainLink = new ConsoleChainLink(settings, this.logentriesChainLink);
    this.chainStart = this.consoleChainLink;
    this.chainEnd = this.bugsnagChainLink;
    this.ChainLink = ChainLink;
  }

  log(logLevel, message, ...args) {
    this.chainStart.handle(new Message(logLevel, message, ...args));
  }
}

/**
 * Configure and return a chain of processing a log message. It should be required on module launch.
 * It sets up loggers, notifiers for bugs, and exposes the internal providers, abstracted.
 * If no parameter is provided, it will return already configured providers
 * @param  {Object} [config] Configuration object required by the internal providers
 * @param  {string} [config.BUGS_TOKEN] Token used by internal notifier to send bug reports to
 * @param  {string} [config.LOGS_TOKEN] Token used by internal logger to send logs to
 * @param  {boolean} [config.CONSOLE_LOGGING] Switches on/off the console logging chain
 * @param  {boolean} [config.LOGENTRIES_LOGGING] Switches on/off the logentries logging chain
 * @param  {boolean} [config.BUGSNAG_LOGGING] Switches on/off the bugsnag logging chain
 * @param  {boolean} [config.MIN_LOG_LEVEL] Minimal log level for a message to be processed
 * @param  {boolean} [config.MIN_LOG_LEVEL_CONSOLE] Minimal log level for a message to be processed by console chain link (more prior over MIN_LOG_LEVEL)
 * @param  {boolean} [config.MIN_LOG_LEVEL_LOGENTRIES] Minimal log level for a message to be processed by logentries chain link (more prior over MIN_LOG_LEVEL)
 * @param  {boolean} [config.MIN_LOG_LEVEL_BUGSNAG] Minimal log level for a message to be processed by bugsnag chain link (more prior over MIN_LOG_LEVEL)
 * @param  {boolean} [config.DEFAULT_LOG_LEVEL] Fall back if a message does not have one
 * Note that this module can also be configured with environment variables.
 * Environment variables have higher priority over a settings object
 * @return {Object}        The configured providers
 */
module.exports = (config) => {
  if (!config) {
    if (instance) return instance;
    console.error('Dial Once boot module should be initilised before used without config.');
  }

  const settings = Object.assign({
    BUGS_TOKEN: process.env.BUGS_TOKEN || process.env.BUGSNAG_TOKEN,
    LOGS_TOKEN: process.env.LOGS_TOKEN || process.env.LOGENTRIES_TOKEN
  }, config);
  const chain = new LoggerChain(settings);
  instance = {
    chain,
    logger: new Winston(chain),
    notifier: new Bugsnag(settings)
  };
  return instance;
};
