'use strict';

let url = require('url');
let path = require('path');
let basename = path.basename;
let extname = path.extname;
let fs = require('fs');

module.exports = (opt) => {
    let staticPath = path.join(__dirname, opt.staticPath);
    return (req, res) => {
        try {
            let u = url.parse(req.url);
            let filePath = path.join(staticPath, u.pathname);
            let state = fs.statSync(filePath);
            if (state.isFile()) {
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.writeHead(404);
                res.end(`not found ${staticPath}`);
            }
        } catch (e) {
            res.writeHead(404);
            res.end(`not found ${staticPath}`);
        }
    }
}
