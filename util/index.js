'use strict';

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

module.exports = {
    getPipe
}
