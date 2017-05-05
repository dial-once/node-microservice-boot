const ChainLink = require('./chain-link');
const bugsnag = require('bugsnag');

class BugsnagLink extends ChainLink {
  constructor(settings, nextChainLink) {
    super(settings, nextChainLink);
    if (settings.BUGS_TOKEN) {
      bugsnag.register(settings.BUGS_TOKEN, {
        releaseStage: process.env.NODE_ENV || 'dev',
        notifyReleaseStages: ['production', 'staging']
      });
      this.notifier = bugsnag;
    } else {
      console.warn('Bugsnag logging was not initialized due to a missing token');
    }
  }

  isReady() {
    return !!this.notifier;
  }

  willBeUsed() {
    return ['true', 'false'].includes(process.env.BUGSNAG_LOGGING) ?
      process.env.BUGSNAG_LOGGING === 'true' : !!this.settings.BUGSNAG_LOGGING;
  }
  // handle function is not allowed to modify a message
  handle(message) {
    const shouldBeUsed = this.willBeUsed();
    if (this.isReady() && shouldBeUsed) {
      const notify = (typeof message.meta.notify === 'boolean') ? message.meta.notify : shouldBeUsed;
      const messageLevel = this.levels.has(message.level) ? message.level : this.levels.get('default');
      const minLogLevel = this.getMinLogLevel(this.chain);
      if (this.levels[messageLevel] >= this.levels[minLogLevel] && notify) {
        this.notifier.notify(message);
      }
    }
    this.next(message);
  }
}

module.exports = BugsnagLink;
