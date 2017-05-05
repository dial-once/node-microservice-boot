class ChainLink {
  constructor(settings, nextChainLink) {
    this.nextLink = nextChainLink;
    this.settings = settings;
    const levels = [
      ['silly', 0],
      ['verbose', 1],
      ['info', 2],
      ['warn', 3],
      ['error', 4],
      ['default', process.env.DEFAULT_LOG_LEVEL || 'info']
    ];
    this.levels = new Map(levels);
  }

  getMinLogLevel(chain) {
    const minLogLevel = process.env[`MIN_LOG_LEVEL_${chain}`] || this.settings[`MIN_LOG_LEVEL_${chain}`] ||
        process.env.MIN_LOG_LEVEL || this.settings.MIN_LOG_LEVEL;
    if (!this.levels.has(minLogLevel)) {
      return this.levels.get('default');
    }
    return minLogLevel;
  }

  next(message) {
    if (this.nextLink) {
      this.nextLink.handle(message);
    }
  }

  link(nextLink) {
    this.nextLink = nextLink;
  }

  isReady() {
    throw new Error('Not implemented exception');
  }

  willBeUsed() {
    throw new Error('Not implemented exception');
  }

  handle() {
    throw new Error('Not implemented exception');
  }
}

module.exports = ChainLink;
