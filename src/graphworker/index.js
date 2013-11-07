"use strict";
var child_process = require('child_process'),
    worker = initWorker(),
    environment = require('../lib/environment'),
    uuid = require('node-uuid');

var handlers = { };

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

function initWorker() {
    var child = child_process.fork(__dirname + '/child');
    setImmediate(function () {
        child.send({ setEnv: JSON.stringify(environment,
            function (key, value) {
                if (key === 'errorlog' || key === 'accesslog' || key === 'graphstore' || key === 'datastore' || key === 'cache' || key === 'esclient') {
                    return undefined;
                }
                return value;
            })
        });
    });
    child.on('message', function (message) {
        if (handlers[message.id]) {
            var handler = handlers[message.id];
            delete handlers[message.id];
            handler(message);
        }
    });
    child.on('exit', function () {
        worker = initWorker();
    });
    return child;
}
