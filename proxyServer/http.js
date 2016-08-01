'use strict';

let http = require('http');
let url = require('url');
let logServer = require('../logServer');
let ruleDao = require('../dao/rule');
let fs = require('fs');
let log = require('debug')('http');
let Readable = require('stream').Readable;
let path = require('path');
let util = require('../util');
let zlib = require('zlib');

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


    let apiName = req.body && (req.body['api_name'] || req.body['apiName']) ||
        req.query && (req.query['api_name'] || req.query['apiName']);


    // 代理到本地静态文件
    let ruleMap = ruleDao.getRuleMap();
    if (!apiName)
        for (let key in ruleMap) {
            let rule = new RegExp(key);
            if (rule.test(req.url)) {
                proxyStatic(req, res, ruleMap[key].path, key, ruleMap[key].isOnline);
                return;
            }
        }

    // 代理到指定host
    let host = ruleDao.getHost();
    if (host) {
        proxyAll(req, res, null, host);
        return;
    }

    // 代理mock数据
    if (apiName) {
        let mockPath = ruleDao.getMockPath();
        if (mockPath && mockPath.length) {
            proxyMock(req, res, apiName, mockPath);
            return;
        }
    }

    // 正常代理
    proxyAll(req, res);
}

let proxyMock = (req, res, apiName, mockPath) => {
    let param = req.query || req.body;
    let modulePath = path.join(mockPath, apiName);
    try {
        require.cache[require.resolve(modulePath)] && delete require.cache[require.resolve(modulePath)];
        let method = require(modulePath);
        let data = method(param);
        data = JSON.stringify(data);
        res.end(data);
        logServer.setProxyMock(req.logId, data, apiName);
    } catch (e) {
        res.writeHead(502);
        res.end(`some thing wrong with ${modulePath}`);
        logServer.setProxyMock(req.logId, false, apiName);
    }
}

let proxyStatic = (req, res, filePath, rule, isOnline) => {
    if (!util.isFile(filePath)) {
        let u = url.parse(req.url);
        filePath = path.join(filePath, u.pathname);
    }
    if (!util.isFile(filePath)) {
        logServer.setProxyStatic(req.logId, false, filePath, rule);
        res.writeHead(404);
        res.end(`not found ${filePath}`);
    } else {
        let readable = fs.createReadStream(filePath);
        if (isOnline) {
            proxyAll(req, res, (pRes) => {
                let out = readable;
                if (pRes && pRes.headers && pRes.headers['content-encoding'] == 'gzip') {
                    out = zlib.createGzip();
                    readable.pipe(out);
                }
                out.pipe(res);
                logServer.setProxyStatic(req.logId, readable, filePath, rule, pRes && pRes.headers);
            });
        } else {
            readable.pipe(res);
            logServer.setProxyStatic(req.logId, readable, filePath, rule);
        }
    }
}


let proxyAll = (cReq, cRes, donePipe, host) => {
    let u = url.parse(cReq.url);
    if (host) {
        let m = cReq.headers.host && cReq.headers.host.match(/(\S*):\S*/);
        if (m) {
            cReq.headers.host = m[1];
        }
    }
    let options = {
        hostname: host || u.hostname,
        port: host ? 80 : (u.port || 80),
        path: u.path,
        method: cReq.method,
        headers: cReq.headers
    };
    let pReq = http.request(options, function(pRes) {
        // Some header contains spaces, at least being error node v51
        for (let key in pRes.headers) {
            if (/\s$/.test(key)) {
                pRes.headers[key.trim()] = pRes.headers[key];
                delete pRes.headers[key];
            }
        }
        cRes.writeHead(pRes.statusCode, pRes.headers);
        if (donePipe) {
            donePipe(pRes);
        } else {
            pRes.pipe(cRes);
            logServer.setRes(cReq.logId, pRes);
        }
    }).on('error', function(e) {
        if (donePipe) {
            donePipe();
        } else {
            cRes.writeHead(404);
            cRes.end(`can not open ${cReq.url}`);
        }
    });

    cReq._stream.pipe(pReq);
    startPipe(cReq);
}

let startPipe = (req) => {
    let contentType = req.headers['content-type'];
    if (contentType && ~contentType.indexOf('multipart/form-data;')) {
        // buffer
        req._stream.push(Buffer.concat(req._rawBody));
    } else {
        req._stream.push(req._rawBody.join(''));
    }
    req._stream.push(null);
}


module.exports = request;
