'use strict';

let path = require('path');
let fs = require('fs');
let os = require('os');
let util = require('../util');

let tempPath = path.join(os.tmpdir(), 'groundhog-rule');

let _readTemp = () => {
    try {
        let str = fs.readFileSync(tempPath, 'utf-8');
        console.log(str);
        return JSON.parse(str);
    } catch (e) {
        console.log('no temp conf');
        return {};
    }
}

let ruleData = _readTemp();

let _writeTemp = () => {
    let str = JSON.stringify(ruleData);
    fs.writeFileSync(tempPath, str, 'utf-8');
}

let create = (data) => {
    let newData = Object.assign({
        id: util.generateId(),
        name: '',
        status: true,
        isOnline: false,
        mockPath: '',
        ruleStr: '',
        host: '',
    }, data);
    ruleData[newData.id] = newData;
    _writeTemp();
};

let del = (id) => {
    delete ruleData[id];
    _writeTemp();
};


let getRuleData = () => {
    return ruleData;
};

let _getList = () => {
    let mockList = [];
    let ruleMap = {};
    let host = '';
    for (let id in ruleData) {
        let item = ruleData[id];
        if (item.status) {
            _parseRuleStr(ruleMap, item.ruleStr, item.isOnline);
            mockList.push(item.mockPath);
            host = item.host;
        }
    }
    return {
        mockList,
        ruleMap,
        host
    }
}

let getRuleMap = () => {
    return _getList().ruleMap;
}

let getMockPath = () => {
    return _getList().mockList[0];
}

let getHost = () => {
    return _getList().host;
}

let _parseRuleStr = (rule, ruleStr, isOnline) => {
    let ruleList = ruleStr.split('\n');
    for (let i = 0; i < ruleList.length; i++) {
        let line = ruleList[i];
        let m = line.trim().match(/(\S*) +(\S*)/);
        if (!m) continue;
        rule[m[1]] = {
            path: m[2],
            isOnline: isOnline
        };
    }
    return rule;
}

module.exports = {
    create,
    del,
    getRuleData,
    getRuleMap,
    getMockPath,
    getHost
}
