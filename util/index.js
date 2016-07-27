'use strict';
let crypto = require('crypto');
let fs = require('fs-extra');
let os = require('os');
let path = require('path');

let getPipe = (p, done, fail, type) => {
    let _chunk = [];
    p.on('data', chunk => {
        _chunk.push(chunk);
    }).on('end', () => {
        if (type == 'buffer') {
            let b = Buffer.concat(_chunk);
            done && done(b);
        } else done && done(_chunk.join(''));
    }).on('error', () => {
        fail && fail();
    });
    return p;
}

let generateId = () => {
    var id = crypto.randomBytes(16).toString('hex');
    return id;
}

let isFile = (filePath) => {
    try {
        let state = fs.statSync(filePath);
        if (state.isFile()) return true;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
}

let getDataPath = () => {
    let homedir = typeof os.homedir == 'function' ? os.homedir() :
        process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
    let dataDir = path.join(homedir, '.GroundhogAppData');
    let filePath = path.join(dataDir, 'Groundhog-rule');
    fs.ensureFileSync(filePath);
    return filePath;
}


module.exports = {
    getPipe,
    generateId,
    isFile,
    getDataPath
}
