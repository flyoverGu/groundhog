'use strict';

let http = require('http');
let logServer = require('../logServer');
let Primus = require('primus');
let url = require('url');
let rule = require('../rule');
let util = require('../util');
let log = require('debug')('viewServer');

let app = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    let u = url.parse(req.url);
    // router
    if (/^\/setRule/i.test(u.path)) {
        util.getPipe(req, (body) => {
            try {
                rule.set(body);
                res.end('ok');
            } catch (e) {
                res.end(e.message);
            }
        }, (e) => {
            res.end(e.message);
        });
    } else if (/^\/getRule/i.test(u.path)) {
        let data = rule.getRawConf();
        res.end(JSON.stringify(data));
    } else {
        res.end('not found !');
    }
});
let primus = new Primus(app);


primus.save(__dirname + '/static/primus.js');
primus.on('connection', spark => {
    console.log('ws connectioned');

    logServer.eventEmitter.on('hasProxyData', proxyData => {
        spark.write(proxyData);
    });
});

app.listen(8887, () => {
    console.log('web start');
})
