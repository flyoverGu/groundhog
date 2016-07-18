'use strict';

let path = require('path');

module.exports = function() {
    return {
        id: '123123',
        isOnline: false,
        mockPath: path.join(__dirname, '/mock'),
        ruleStr: '/static ' + __dirname,
        name: 'test',
        status: true,
    }
}
