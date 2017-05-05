const { notifier, logger } = require('./index')({
  BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
  LOGS_TOKEN: '00000000-0000-0000-0000-000000000000'
});

console.log(typeof notifier);
console.log(typeof logger);
console.log();
console.log(logger.info);
console.log(logger.warn);
console.log(logger.error);
console.log(logger.debug);
console.log(logger.silly);
console.log(logger.verbose);
console.log();

logger.info('[Daniel] New Logging conventions tests');
logger.warn('[Daniel] New Logging conventions tests');
logger.error(new Error('[Daniel] New Logging conventions tests'));
logger.debug('[Daniel] New Logging conventions tests', { notify: false, other: 'thing' });
logger.silly('[Daniel] New Logging conventions tests');
logger.verbose('[Daniel] New Logging conventions tests');

logger.warn();
logger.warn(null);
logger.warn(undefined);
