'use strict';

let http = require('http');
let logServer = require('../logServer');
let Primus = require('primus');
let url = require('url');
let rule = require('../rule');

let app = http.createServer((req, res) => {
    let u = url.parse(req.url);
    if (/^\/setRule/i.test(u.path)) {
        let chunk = [];
        req.on('data', c => chunk.push(c))
            .on('end', () => {
                let ruleStr = chunk.join('');
                try {
                    rule.set(ruleStr);
                    res.end('ok');
                } catch (e) {
                    res.end(e.message);
                }
            })
            .on('error', e => {
                res.end(e.message);
            });
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
