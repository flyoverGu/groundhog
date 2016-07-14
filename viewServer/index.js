'use strict';

let http = require('http');
let logServer = require('../logServer');
let Primus = require('primus');
let url = require('url');
let ruleDao = require('../dao/rule');
let util = require('../util');
let log = require('debug')('viewServer');

let staticServer = require('./static')({
    staticPath: 'static'
});

let app = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    let u = url.parse(req.url);
    // router
    if (/^\/setRule/i.test(u.path)) {
        util.getPipe(req, (body) => {
            try {
                ruleDao.create(JSON.parse(body));
                res.end('ok');
            } catch (e) {
                res.setHeader('statusCode', 500);
                res.end(e.message);
            }
        }, (e) => {
            res.setHeader('statusCode', 500);
            res.end(e.message);
        });
    } else if (/^\/delRule/i.test(u.path)) {
        let id = u.query.match(/id=(\S*)/)[1];
        ruleDao.del(id);
        res.end('ok');
    } else if (/^\/getRule/i.test(u.path)) {
        let data = ruleDao.getRuleData();
        res.end(JSON.stringify(data));
    } else {
        staticServer(req, res);
    }
});
let primus = new Primus(app);


primus.save(__dirname + '/static/js/ws.js');
primus.on('connection', spark => {
    console.log('ws connectioned');

    logServer.eventEmitter.on('hasProxyData', proxyData => {
        spark.write(proxyData);
    });
});

app.listen(8887, () => {
    console.log('web start');
})
