'use strict';
let path = require('path');
let fs = require('fs');
let os = require('os');

let tempPath = path.join(os.tmpdir(), 'groundhog-temp');

let conf = {
    root: '',
    mock: {
        path: '',
        status: true
    },
    rule: {
        string: '',
        status: true
    }
};

let _readTemp = () => {
    try {
        let str = fs.readFileSync(tempPath, 'utf-8');
        set(str);
    } catch (e) {
        console.log('no temp conf');
    }
}

let _writeTemp = (str) => {
    fs.writeFileSync(tempPath, str, 'utf-8');
}

let _setRule = (rule) => {
    conf.rule.string = rule.string;
    conf.rule.status = rule.status;
}

let _setRoot = (root) => {
    conf.root = root;
}

let _setMock = (mock) => {
    conf.mock.status = mock.status;
    conf.mock.path = mock.path;
}

let _parseRuleStr = (ruleStr) => {
    let rule = {};
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
    return rule;
}

let set = (str) => {
    let data = JSON.parse(str);
    _setRule(data.rule);
    _setRoot(data.root);
    _setMock(data.mock);
    console.log(conf);
    _writeTemp(str);
}

let getRawConf = () => {
    return conf;
}

let get = () => {
    let rule = _parseRuleStr(conf.rule.string);
    return {
        mock: conf.mock.status ? conf.mock.path : '',
        rule: conf.rule.status ? rule : {}
    }
}



_readTemp();

module.exports = {
    get: get,
    set: set,
    getRawConf
}
