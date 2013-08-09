var worker = require('child_process').fork(__dirname + '/graphworker');
var inspect = require('eyes').inspector({maxLength: false});

var handlers = [ ];

worker.on('message', function (message) {
    if (typeof message.id === 'number') {
        if (handlers[message.id]) {
            handlers[message.id](message);
        }
    }
});

module.exports = function (type, data, callback) {
    handlers.push(callback);
    var message = { id: handlers.length - 1 };
    message[type] = data;
    worker.send(message);
};

process.on('exit', function () {
    worker.kill();
});
