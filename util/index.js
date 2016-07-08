'use strict';

let getPipe = (p, done, fail) => {
    let _chunk = [];
    p.on('data', chunk => {
        _chunk.push(chunk);
    }).on('end', () => {
        done && done(_chunk.join(''));
    }).on('error', () => {
        fail && fail();
    });
    return p;
}

module.exports = {
    getPipe
}
