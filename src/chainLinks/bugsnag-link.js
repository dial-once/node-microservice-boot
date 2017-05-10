const ChainLink = require('./chain-link');
const bugsnag = require('bugsnag');

/**
  @class BugsnagLink
  A Bugsnag notification chain link
  @implements ChainLink @class - a basic interface for each link based on the Chain of Resp Pattern
  This chain link is responsible for firing a notification to the bugsnag endpoint

  Has the following configurations (either env var or settings param):
  - BUGSNAG_LOGGING {'true'|'false'} - switches on / off the use of this chain link
  - MIN_LOG_LEVEL_BUGSNAG = {'silly'|'verbose'|'debug'|'info'|'warn'|'error'} - min log level of a message to notify
  This config has a higher priority than a global DEFAULT_LOG_LEVEl config
  @see ChainLink @class for info on the log level priorities
  If a message's level is >= than a MIN_LOG_LEVEL_BUGSANG - it will be notified. Otherwise - skipped

  Environment variables have a higher priority over a settings object parameters
**/
class BugsnagLink extends ChainLink {
  /**
    @constructor
    Construct an instance of a BugsnagLink @class
    @param settings {Object} - LoggerChain configuration object
    @param nextChainLink {Object} - Optional parameter. A next object on the chain
  **/
  constructor(settings, nextChainLink) {
    super(nextChainLink, settings);
    if (this.settings.BUGS_TOKEN) {
      bugsnag.register(this.settings.BUGS_TOKEN, {
        releaseStage: process.env.NODE_ENV || 'dev',
        notifyReleaseStages: ['production', 'staging']
      });
      this.notifier = bugsnag;
      this.chain = 'BUGSNAG';
    } else {
      console.warn('Bugsnag logging was not initialized due to a missing token');
    }
  }

  /**
    @function isReady
    Check if a chain link is configured properly and is ready to be used
    @return {boolean}
  **/
  isReady() {
    return !!this.notifier;
  }

  /**
    @function willBeUsed
    Check if a chain link will be used
    Depends on configuration env variables / settings object parameters
    Checks BUGSNAG_LOGGING env / settings object param
    @return {boolean} - if this chain link is switched on / off
  **/
  willBeUsed() {
    return ['true', 'false'].includes(process.env.BUGSNAG_LOGGING) ?
      process.env.BUGSNAG_LOGGING === 'true' : !!this.settings.BUGSNAG_LOGGING;
  }

  /**
    @function handle
    Process a message and notify it if the chain link is switched on and message's log level is >= than MIN_LOG_LEVEL
    Finally, pass the message to the next chain link if any
    @param message {Object} - message package object
    @see LoggerChain message package object structure description

    This function is NOT ALLOWED to modify the message
    This function HAS to invoke the next() @function and pass the message further along the chain
  **/
  handle(message) {
    const shouldBeUsed = this.willBeUsed();
    if (this.isReady() && shouldBeUsed && message) {
      const notify = (typeof message.meta.notify === 'boolean') ? message.meta.notify : shouldBeUsed;
      const messageLevel = this.logLevels.has(message.level) ? message.level : this.logLevels.get('default');
      const minLogLevel = this.getMinLogLevel(this.chain);
      if (this.logLevels.get(messageLevel) >= this.logLevels.get(minLogLevel) && notify) {
        if (message.meta.stack !== undefined) {
          const error = new Error(message.text);
          error.stack = message.meta.stack;
          this.notifier.notify(error, { user: message.meta });
        } else {
          this.notifier.notify(message.text, { user: message.meta });
        }
      }
    }
    this.next(message);
  }
}

module.exports = BugsnagLink;
