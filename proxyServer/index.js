'use strict';

let http = require('http');
http.createServer()
    .on('request', require('./http'))
    .on('connect', require('./https'))
    .listen(8888);
