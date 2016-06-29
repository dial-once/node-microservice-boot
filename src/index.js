require('./env');

module.exports = (config) => {
  config = Object.assign({}, config, {
    BUGS_TOKEN: process.env.BUGSNAG_TOKEN,
    LOGS_TOKEN: process.env.LOGENTRIES_TOKEN
  });

  require('./bugsnag')(config.BUGS_TOKEN);
  require('./winston')(config.LOGS_TOKEN);
};
