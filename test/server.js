'use strict';

let app = require('koa')();
let server = require('koa-static');

app.use(server(__dirname));
app.listen(8080);
