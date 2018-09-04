# node-microservice-boot

[![Circle CI](https://circleci.com/gh/dial-once/node-microservice-boot/tree/develop.svg?style=shield)](https://circleci.com/gh/dial-once/node-microservice-boot)


boot scripts to configure @dial-once node microservices
requires es6


## Installing the module
```bash
npm i @dialonce/boot
```

## Using it
Require it as the first instruction (after env vars are set)
```js
require('@dialonce/boot')({
    LOGS_TOKEN: '',
    BUGS_TOKEN: ''
});
```

## Using logger/reporter
You can use the logger/reporter directly from the module, without including the deps in your project. This will allow us to update/switch providers easily.

```js
const logger = require('@dialonce/boot')().logger;
const notifier = require('@dialonce/boot')().notifier;
```

*Please note that these instructions will print an error if the module has not been initialised before*

## Logger error/warn forward
If you use the logger with error/warn level, the message is automatically
forwarded to the notifier. You still have the ability to disable it globally or
locally.

```js
const logger = require('@dialonce/boot')({ NOTIFY: false }).logger; // to disable it globally
```

```js
const logger = require('@dialonce/boot')().logger;

logger.error(err, { notify: false }); // to disable it only for this log
```

The local disable/enable have the priority over the global


## Current included modules
  - Bugsnag (bug reports)
  - Logentries (logs)
  - Winston (logs)
