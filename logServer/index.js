'use strict';

let zlib = require('zlib');
let logData = {};
let EventEmitter = require('events');
let eventEmitter = new EventEmitter();
let crypto = require('crypto');
let log = require('debug')('logServer');
let util = require('../util');

let createData = (req) => {
    var id = crypto.randomBytes(16).toString('hex');
    logData[id] = {
        id: id,
        url: '',
        method: '',
        statusCode: '',
        req: {
            headers: '',
            body: '',
        },
        res: {
            headers: '',
            body: ''
        }
    };
    log(`new request, Id : ${id}`);
    req.logId = id;
    return id;
}

let setReq = (id, req) => {
    let data = logData[id];
    if (!data) {
        log(`Data is null, Id: ${id}`);
        return;
    }
    data.url = req.url;
    data.method = req.method;
    Object.assign(data.req, {
        headers: req.headers
    });
    getPipe(req._stream, body => {
        data.req.body = body;
    })
}

let setProxyStatic = (id, stream, filePath, rule) => {
    let data = logData[id];
    data.res.proxy = {
        type: 'static',
        rule: rule,
        localPath: filePath
    }
    if (stream === false) {
        data.res.statusCode = 1500;
        eventEmitter.emit('hasProxyData', data);
    } else {
        data.res.statusCode = 1200;
        getPipe(stream, (body) => {
            data.res.body = body;
        }).on('end', () => {
            logData[id] = null;
            eventEmitter.emit('hasProxyData', data);
        });
    }
}

let setProxyMock = (id, body, apiName) => {
    let data = logData[id];
    data.res.proxy = {
        type: 'mock',
        apiName: apiName
    }
    if (body === false) {
        data.res.statusCode = 1500;
    } else {
        data.res.body = body;
        data.res.statusCode = 1200;
    }
    eventEmitter.emit('hasProxyData', data);

}

let setRes = (id, res) => {
    let data = logData[id];
    if (!data) {
        log(`Data is null, Id: ${id}`);
        return;
    }
    data.res.statusCode = res.statusCode;
    Object.assign(data.res, {
        headers: res.headers,
    });
    let out;
    if (res.headers && res.headers['content-encoding'] == 'gzip') {
        out = zlib.createGunzip();
        res.pipe(out);
    } else if (res.headers && res.headers['content-encoding'] == 'deflate') {
        out = zlib.createInflate();
        res.pipe(out);
    } else out = res;
    getPipe(out, (body) => {
        data.res.body = body;
    }).on('end', () => {
        eventEmitter.emit('hasProxyData', data);
        logData[id] = null;
    });
}

let getPipe = (p, done, fail) => {
    return util.getPipe(p, done, fail);
}

let getData = () => {
    return logData;
}

module.exports = {
    setReq,
    setRes,
    createData,
    eventEmitter,
    getData,
    setProxyStatic,
    setProxyMock
}
