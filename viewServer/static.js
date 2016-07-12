'use strict';

let url = require('url');
let path = require('path');
let basename = path.basename;
let extname = path.extname;
let fs = require('fs');

module.exports = (opt) => {
    let staticPath = path.join(__dirname, opt.staticPath);
    return (req, res) => {
        let u = url.parse(req.url);
        let filePath = path.join(staticPath, u.pathname);
        fs.createReadStream(filePath).pipe(res);
    }
}
