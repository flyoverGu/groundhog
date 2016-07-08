'use strict';

let http = require('http');
let url = require('url');
let logServer = require('../logServer');
let ruleMap = require('../rule').get();
let mockPath = require('../rule').getMock();
let fs = require('fs');
let log = require('debug')('http');
let Readable = require('stream').Readable;
let path = require('path');

function request(req, res) {
    log(`http request url : ${req.url}`);
    queryParser(req);
    bodyParser(req, (err, body) => {
        if (err) {
            res.end(err.message);
        } else {
            next(req, res);
        }
    });
}

let queryParser = (req) => {
    let u = url.parse(req.url);
    req.queryString = u.query;
    req.query = parserQueryString(u.query);
}

let bodyParser = (req, done) => {
    req._rawBody = [];
    req._stream = new Readable;
    req.on('data', c => {
        req._rawBody.push(c);
    }).on('end', () => {
        req.bodyString = req._rawBody.join('');
        let contentType = req.headers['content-type'];
        try {
            req.body = parserString(contentType, req.bodyString);
            done && done(null, req.body);
        } catch (e) {
            done && done(e);
        }
    }).on('error', (e) => {
        log(`body parser err ${e.message}`);
        done && done(e)
    });
}

let parserString = (contentType, string) => {
    if (!contentType) return '';
    if (~contentType.indexOf('application/x-www-form-urlencoded')) {
        return parserQueryString(string);
    } else if (~contentType.indexOf('application/json')) {
        return JSON.parse(string);
    } else if (~contentType.indexOf('multipart/form-data;')) {
        let pattern = contentType.match(/boundary=(\S*)/)[1];
        let l = string.split('--' + pattern);
        let obj = {};
        for (let i = 0; i < l.length; i++) {
            let m = l[i].match(/name="(\S+)"\r\n\r\n(\S*)/);
            if (!m) continue;
            obj[m[1]] = m[2];
        }
        return obj;
    }
    return '';
}

let parserQueryString = (string) => {
    if (!string) return '';
    let l = string.split('&');
    let obj = {};
    for (let i = 0; i < l.length; i++) {
        let m = l[i].split('=');
        if (!m) continue;
        obj[m[0]] = m[1];
    }
    return obj;
}


let next = (req, res) => {

    // 监听请求数据
    logServer.createData(req);
    logServer.setReq(req.logId, req);


    // 代理mock数据
    let apiName = req.body && (req.body['api_name'] || req.body['apiName']) ||
        req.query && (req.query['api_name'] || req.query['apiName']);
    if (apiName) {
        proxyMock(req, res, apiName);
        return;
    }

    // 代理到本地静态文件
    for (let key in ruleMap) {
        let rule = new RegExp(key);
        if (rule.test(req.url)) {
            proxyStatic(req, res, ruleMap[key], key);
            return;
        }
    }

    // 正常代理
    proxyAll(req, res);
}

let proxyMock = (req, res, apiName) => {
    let param = req.query || req.body;
    let modulePath = path.join(mockPath, apiName);
    require.cache[require.resolve(modulePath)] && delete require.cache[require.resolve(modulePath)];
    let method = require(modulePath);
    let data = method(param);
    try {
        data = JSON.stringify(data);
        res.end(data);
        logServer.setProxyMock(req.logId, data, apiName);
    } catch (e) {
        res.end();
        logServer.setProxyMock(req.logId, false, apiName);
    }
}

let proxyStatic = (req, res, filePath, rule) => {
    if (!isFile(filePath)) {
        let u = url.parse(req.url);
        filePath = path.join(filePath, u.pathname);
    }
    if (!isFile(filePath)) {
        logServer.setProxyStatic(req.logId, false, filePath, rule);
    } else {
        let readable = fs.createReadStream(filePath);
        readable.pipe(res);
        logServer.setProxyStatic(req.logId, readable, filePath, rule);
    }
}

let proxyAll = (cReq, cRes) => {
    let u = url.parse(cReq.url);
    let options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: cReq.method,
        headers: cReq.headers
    };

    let pReq = http.request(options, function(pRes) {
        cRes.writeHead(pRes.statusCode, pRes.headers);
        pRes.pipe(cRes);
        logServer.setRes(cReq.logId, pRes);
    }).on('error', function(e) {
        cRes.end();
    });

    cReq._stream.pipe(pReq);
    startPipe(cReq);
}

let startPipe = (req) => {
    let t;
    while (t = req._rawBody.pop()) {
        req._stream.push(t);
    }
    req._stream.push(null);
}

let isFile = (filePath) => {
    let state = fs.statSync(filePath);
    if (state.isFile()) return true;
    else return false;
}


module.exports = request;
