# node-microservice-boot

[![Circle CI](https://circleci.com/gh/dial-once/node-microservice-boot/tree/develop.svg?style=shield)](https://circleci.com/gh/dial-once/node-microservice-boot)
[![Coverage](http://badges.dialonce.io/?resource=node-microservice-boot&metrics=coverage)](http://sonar.dialonce.io/overview/coverage?id=node-microservice-boot)
[![Sqale](http://badges.dialonce.io/?resource=node-microservice-boot&metrics=sqale_rating)](http://sonar.dialonce.io/overview/debt?id=node-microservice-boot)

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

## Current included modules
  - Bugsnag (bug reports)
  - Logentries (logs)
  - Winston (logs)
