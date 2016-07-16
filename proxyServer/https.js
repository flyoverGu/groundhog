'use strict';

let url = require('url');
let net = require('net');
let log = require('debug')('https');
let logServer = require('../logServer');

function connect(cReq, cSock) {
    log('connect');
    let u = url.parse('http://' + cReq.url);
    logServer.setTunnel(cReq);
    let pSock = net.connect(u.port, u.hostname, function() {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function(e) {
        cSock.end();
    });

    cSock.pipe(pSock);
}

module.exports = connect;
