const ChainLink = require('./chain-link');
const bugsnag = require('bugsnag');

/**
  @class BugsnagLink
  A Bugsnag notification chain link
  @implements ChainLink @class - a basic interface for each link based on the Chain of Resp Pattern
  This chain link is responsible for firing a notification to the bugsnag endpoint

  Has the following configurations (either env var or settings param):
  - BUGSNAG_LOGGING {'true'|'false'} - switches on / off the use of this chain link
  @see ChainLink @class for info on the log level priorities
  If a message's level is >= than a error - it will be notified. Otherwise - skipped

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
    const notifyReleaseStages = process.env.BUGSNAG_RELEASE_STAGES ?
      process.env.BUGSNAG_RELEASE_STAGES.split(',') : this.settings.BUGSNAG_RELEASE_STAGES;
    if (this.settings.BUGS_TOKEN) {
      bugsnag.register(this.settings.BUGS_TOKEN, {
        releaseStage: process.env.NODE_ENV || 'local',
        notifyReleaseStages
      });
      this.notifier = bugsnag;
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
    @function isEnabled
    Check if a chain link will be used
    Depends on configuration env variables / settings object parameters
    Checks BUGSNAG_LOGGING env / settings object param
    @return {boolean} - if this chain link is switched on / off
  **/
  isEnabled() {
    return ['true', 'false'].includes(process.env.BUGSNAG_LOGGING) ?
      process.env.BUGSNAG_LOGGING === 'true' : !!this.settings.BUGSNAG_LOGGING;
  }

  /**
    @function handle
    Process a message and notify it if the chain link is switched on and message's log level is >= than MIN_LOG_LEVEL
    Finally, pass the message to the next chain link if any
    @param data {Object} - message package object
    @see LoggerChain message package object structure description

    This function is NOT ALLOWED to modify the message
    This function HAS to invoke the next() @function and pass the message further along the chain
  **/
  handle(data) {
    const shouldBeUsed = this.isEnabled();
    if (this.isReady() && shouldBeUsed && data) {
      const message = data.payload;
      const notify = (typeof message.meta.notify === 'boolean') ? message.meta.notify : shouldBeUsed;
      const messageLevel = this.logLevels.has(message.level) ? message.level : this.logLevels.get('default');
      if (this.logLevels.get(messageLevel) >= this.logLevels.get('error') && notify) {
        if (message.meta.stack !== undefined) {
          const error = new Error(message.text);
          error.stack = message.meta.stack;
          this.notifier.notify(error, { user: message.meta });
        } else {
          this.notifier.notify(message.text, { user: message.meta });
        }
      }
    }
    this.next(data);
  }
}

module.exports = BugsnagLink;
