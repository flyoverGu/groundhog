'use strict';

let app = require('koa')();
let server = require('koa-static');

app.use(server(__dirname));

app.use(function*() {
    this.body = JSON.stringify({
        abc: 1
    });
});

app.listen(8080);
