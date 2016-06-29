/**
 * winston module. Load winston and prepare transports to manage requests, for all further winston loading
 * @module winston
 */

require('le_node');
var winston = require('winston');

module.exports = (token) => {
  //we do not want console transport in production, because it reduce performances
  if (process.env.CONSOLE_LOGGING === 'false') {
    winston.remove(winston.transports.Console);
  }

  if (token) {
    var logger = winston.add(winston.transports.Logentries, {
      token: token
    });

    logger.rewriters.push(function(level, msg, meta) {
      meta.instanceId = process.env.HOSTNAME;
      return meta;
    });

    return logger;
  }

  return winston;
};

