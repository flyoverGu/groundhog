'use strict';

let request = require('supertest');
let as = require('chai').assert;
let fs = require('fs');
let path = require('path');

let viewUrl = 'http://127.0.0.1:8887';
let proxyUrl = 'http://127.0.0.1:8888';

let ruleObj = require('./rule')();

describe('set/get rule', () => {
    it('set rule', done => {
        request(viewUrl)
            .post('/setRule')
            .send(JSON.stringify(ruleObj))
            .expect(200)
            .end((err, res) => {
                as.equal(res.text, 'ok');
                done();
            });
    });

    it('get rule', done => {
        request(viewUrl)
            .get('/getRule')
            .expect(200)
            .end((err, res) => {
                res.body = JSON.parse(res.text);
                as.deepEqual(res.body[ruleObj.id], ruleObj);
                done();
            });
    });
});


describe('proxy static', () => {
    it('proxy js', done => {
        request(proxyUrl)
            .get('/static/a.js')
            .expect(200)
            .end((err, res) => {
                as.equal(res.text, fs.readFileSync(path.join(__dirname, './static/a.js')));
                done();
            });
    });
});


describe('proxy api', () => {
    it('proxy get api', done => {
        let params = {
            apiName: 'info',
            a: "1"
        };
        request(proxyUrl)
            .get('/api/info?apiName=info&&a=1')
            .expect(200)
            .end((err, res) => {
                res.body = JSON.parse(res.text);
                as.deepEqual(res.body.params, params)
                done();
            });
    });

    it('proxy post api', done => {
        let params = {
            apiName: 'info',
            b: 2
        };
        request(proxyUrl)
            .post('/api/info')
            .send(params)
            .expect(200)
            .end((err, res) => {
                res.body = JSON.parse(res.text);
                as.deepEqual(res.body.params, params)
                done();
            });
    });
});

describe('del rule', () => {
    it('del rule', done => {
        request(viewUrl)
            .get(`/delRule?id=${ruleObj.id}`)
            .expect(200)
            .end((err, res) => {
                as.equal(res.text, 'ok');
                done();
            });
    });
});

