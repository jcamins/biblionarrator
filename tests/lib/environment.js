var fs = require('fs'),
    extend = require('extend'),
    Environment = require('../../src/lib/environment').object,
    config = require('./test-config.json');

module.exports = function (overloads) {
    overloads = overloads || { };
    return new Environment(extend(config, overloads));
};

module.exports.default = require('../../src/lib/environment').load(__dirname + '/test-config.json');

