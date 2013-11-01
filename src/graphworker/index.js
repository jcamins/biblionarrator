"use strict";
var worker = require('child_process').fork(__dirname + '/child'),
    environment = require('../lib/environment'),
    uuid = require('node-uuid');

worker.send({ setEnv: JSON.stringify(environment,
    function (key, value) {
        if (key === 'errorlog' || key === 'accesslog' || key === 'graphstore' || key === 'datastore' || key === 'cache' || key === 'esclient') {
            return undefined;
        }
        return value;
    })
});

var handlers = { };

worker.on('message', function (message) {
    if (handlers[message.id]) {
        var handler = handlers[message.id];
        delete handlers[message.id];
        handler(message);
    }
});

module.exports = function (type, data, callback) {
    var id = uuid.v1();
    handlers[id] = callback;
    var message = { id: id };
    message[type] = data;
    worker.send(message);
    return message;
};

process.on('exit', function () {
    worker.kill();
});
