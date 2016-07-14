'use strict';

let path = require('path');
let fs = require('fs');
let os = require('os');
let util = require('../util');

let ruleData = {};

let create = (data) => {
    let newData = Object.assign({
        id: util.generateId(),
        name: '',
        status: true,
        root: '',
        mock: {
            path: '',
        },
        rule: {
            string: '',
        }
    }, data);
    ruleData[newData.id] = newData;
};

let del = (id) => {
    delete ruleData[id];
};


let getRuleData = () => {
    return ruleData;
};

module.exports = {
    create,
    del,
    getRuleData
}
