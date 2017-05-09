require('./env');
const { packMessage } = require('./utils/message-formatter');
const BugsnagChainLink = require('./chainLinks/bugsnag-link');
const ConsoleChainLink = require('./chainLinks/console-link');
const LogentriesChainLink = require('./chainLinks/logentries-link');
const Bugsnag = require('./adapters/bugsnag');
const Winston = require('./adapters/winston');

let instance;

/**
 Chain of Responsibility pattern
 @see http://www.dofactory.com/javascript/chain-of-responsibility-design-pattern
**/

class LoggerChain {
  constructor(settings) {
    this.settings = settings;
    this.bugsnagChain = new BugsnagChainLink(settings, null);
    this.logentriesChain = new LogentriesChainLink(settings, this.bugsnagChain);
    this.consoleChain = new ConsoleChainLink(settings, this.logentriesChain);
    this.chainStart = this.consoleChain;
    this.chainEnd = this.bugsnagChain;
  }

  log(logLevel, message, ...args) {
    this.chainStart.handle(packMessage(logLevel, message, args));
  }
}

/**
 * Configure and return providers for our microservices. It should be required on module launch.
 * It sets up loggers, notifiers for bugs, and exposes the internal providers, abstracted.
 * If no parameter is provided, it will return already configured providers
 * @param  {Object} [config] Configuration object required by the internal providers
 * @param  {string} [config.BUGS_TOKEN] Token used by internal notifier to send bug reports to
 * @param  {string} [config.LOGS_TOKEN] Token used by internal logger to send logs to
 * @param  {boolean} [config.CONSOLE_LOGGING] Switches on/off the Console logging chain (less prior over env var)
 * @param  {boolean} [config.LOGENTRIES_LOGGING] Switches on/off the Logentries logging chain (less prior over env var)
 * @param  {boolean} [config.BUGSNAG_LOGGING] Switches on/off the BUGSNAG logging chain (less prior over env var)
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
    notifier: new Bugsnag(chain)
  };
  return instance;
};
