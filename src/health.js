var winston = require('winston'),
  startDate = new Date();

/*
 * Print health status every minute, and keep module alive
 */
module.exports = () => {
  winston.info(process.env.HOSTNAME, {
    status: 'running',
    startedAt: startDate,
    uptime: new Date().getTime() - startDate.getTime()
  });
};

setInterval(module.exports, 60*1000);
