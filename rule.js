'use strict';
let path = require('path');

let conf = {
    root: '',
    mock: {
        path: '',
        status: true
    },
    ruleStr: ''
};

let _setRule = (ruleStr) => {
    conf.ruleStr = ruleStr;
}

let _setRoot = (root) => {
    conf.root = root;
}

let _setMock = (mock) => {
    conf.mock.status = mock.status;
    conf.mock.path = mock.path;
}

let set = (str) => {
    let data = JSON.parse(str);
    _setRule(data.ruleStr);
    _setRoot(data.root);
    _setMock(data.mock);
}

let get = () => {
    let rule = {};
    let ruleList = conf.ruleStr.split('\n');
    for (let i = 0; i < ruleList.length; i++) {
        let line = ruleList[i];
        let m = line.trim().match(/(\S*) +(\S*)/);
        if (!m) continue;
        if (conf.root) {
            m[2] = path.join(conf.root, m[2]);
        }
        rule[m[1]] = m[2];
    }
    return Object.assign({}, conf, {
        rule
    });
}

module.exports = {
    get: get,
    set: set
}
