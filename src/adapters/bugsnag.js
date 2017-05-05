const assert = require('assert');
const packMessage = require('../utils/message-formatter');
const BugsnagChainLink = require('../chainLinks/bugsnag-link');

class Bugsnag {
  constructor(loggerChain) {
    assert(loggerChain);
    this.loggerChain = loggerChain;
    // if notify @function is called, a user probably just wants it to be notified without progressing further along the chain
    // that is why we use a seprate instance of a chain link instead of a loggerChain.bugsnagChailLink
    this.bugsnag = new BugsnagChainLink(this.loggerChain.settings, null);
  }

  notify(...args) {
    this.bugsnag.log(packMessage(null, args));
  }
}

module.exports = Bugsnag;
