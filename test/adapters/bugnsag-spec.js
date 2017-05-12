const LoggerChain = require('../../src/index');
const assert = require('assert');

describe('Bugsnag adapter ', () => {
  it('should be initialized', () => {
    const { notifier } = LoggerChain();
    assert.equal(typeof notifier, 'object');
    assert(notifier.settings);
    assert(notifier.bugsnag);
    assert(notifier.notify);
  });

  it('should not break down when null is notified', () => {
    const { notifier } = LoggerChain();
    notifier.notify(null);
  });
});
