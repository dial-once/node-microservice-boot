/**
  @class ChainLink
  A basic interface based on the Chain of Resp Pattern
  Contains common functions, used by chain links implementations
**/
class ChainLink {
  /**
    @constructor
    Construct an instance of a ChainLink class
    @param nextChainLink {Object} - optional next link object in the chain
    @param settings {Object} - chain configuration. Falls back to {} if not provided
    An instance contains a logLevels Map - an object, where a key is a log level and a value is it's priority
    - silly -> 0
    - verbose -> 1
    - debug -> 2
    - info -> 3
    - warn -> 4
    - error -> 5
    In case a typo is done, falls back to a DEFAULT_LOG_LEVEL env or settings parameter or if not provided,
    falls back to 'info' as a default log level
  **/
  constructor(nextChainLink, settings = {}) {
    this.nextLink = nextChainLink;
    this.settings = settings;
    const levels = [
      ['silly', 0],
      ['verbose', 1],
      ['debug', 2],
      ['info', 3],
      ['warn', 4],
      ['error', 5],
      ['default', process.env.DEFAULT_LOG_LEVEL ?
        process.env.DEFAULT_LOG_LEVEL : this.settings.DEFAULT_LOG_LEVEL || 'info']
    ];
    this.logLevels = new Map(levels);
  }

  /**
    @function getMinLogLevel
    Check the env vars and settings object for a provided min log level in general or for a separate chain
    @param chain {string} - an identifier of a chain to check the config for
    Chain - specific config has a higher priority over a general config
    Hence, for example, if a chain has a name X, then MIN_LOG_LEVEL_X will have a higher priority over a MIN_LOG_LEVEL
    @return {string} - a min log level provided in the setup (env or settings object param)
  **/
  getMinLogLevel(chain) {
    const minLogLevel = process.env[`MIN_LOG_LEVEL_${chain}`] || this.settings[`MIN_LOG_LEVEL_${chain}`] ||
        process.env.MIN_LOG_LEVEL || this.settings.MIN_LOG_LEVEL;
    if (!this.logLevels.has(minLogLevel)) {
      return this.logLevels.get('default');
    }
    return minLogLevel;
  }

  /**
    @function next
    @param message {Object} - a message package object
    Envoke the handle @function of the next chain link if provided
  **/
  next(message) {
    if (this.nextLink) {
      this.nextLink.handle(message);
    }
  }

  /**
    @function link
    Links current chain link to a next chain link
    @param nextLink {Object} - an optional next link for current chain link
  **/
  link(nextLink) {
    this.nextLink = nextLink;
  }

  /**
    @function isReady
    Check if a chain link is configured and is ready to be used
    @return {boolean}
    @throws Error if not implemented
  **/
  isReady() {
    throw new Error('Not implemented exception');
  }

  /**
    @function isReady
    Check if a chain link will be used
    @return {boolean}
    @throws Error if not implemented
  **/
  willBeUsed() {
    throw new Error('Not implemented exception');
  }

  /**
    @function isReady
    Process the provided message object
    @param message {Object} - a message package object
    @throws Error if not implemented

    This function is NOT ALLOWED to modify the message
    This function HAS to invoke the next() @function and pass the message further along the chain
    This function HAS to check message level priority and skip if lower than MIN_LOG_LEVEL
  **/
  handle() {
    throw new Error('Not implemented exception');
  }
}

module.exports = ChainLink;
