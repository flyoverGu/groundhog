'use strict';
let crypto = require('crypto');

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
        return false;
    }
}

module.exports = {
    getPipe,
    generateId,
    isFile
}
