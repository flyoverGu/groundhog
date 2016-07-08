'use strict';
let path = require('path');
// 代理规则
let rule = {};

// 代理本地根路径
let conf = {
    root: '/Users/flyover/work/wd-goods-mobile'
};

let get = () => {
    return rule;
}

let getMock = () => {
    return path.join(conf.root, 'mock_ajax');
}

let resetRule = () => {
    for (let key in rule) {
        delete rule[key];
    }
}

let set = (ruleStr) => {
    resetRule();
    let ruleList = ruleStr.split('\n');
    for (let i = 0; i < ruleList.length; i++) {
        let line = ruleList[i];
        let m = line.trim().match(/(\S*) +(\S*)/);
        if (!m) continue;
        if (conf.root) {
            m[2] = path.join(conf.root, m[2]);
        }
        rule[m[1]] = m[2];
    }
    console.log(rule);
}

set(`
    mwdsp.tao21.\\S*/forward.jsp /dist/index.html     
    http://mwdsp.tao21.org /dist
        `)

module.exports = {
    get: get,
    set: set,
    getMock
}
