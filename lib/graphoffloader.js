var worker = require('child_process').fork(__dirname + '/graphworker');
var inspect = require('eyes').inspector({maxLength: false});

var handlers = [ ];

worker.on('message', function (message) {
    if (typeof message.id === 'number') {
        if (handlers[message.id]) {
            var handler = handlers[message.id];
            delete handlers[message.id];
            handler(message);
        }
    }
});

module.exports = function (type, data, callback) {
    handlers.push(callback);
    var message = { id: handlers.length - 1 };
    message[type] = data;
    worker.send(message);
    return message;
};

process.on('exit', function () {
    worker.kill();
});
