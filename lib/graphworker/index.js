var handlers = { };

require("fs").readdirSync(__dirname).forEach(function(file) {
    if (file.indexOf('.js') === file.length - 3 && file !== 'index.js') {
        var handler = require("./" + file);
        handlers[handler.message] = handler;
    }
});

process.on('message', function (message) {
    var handled = false;
    for (var handler in handlers) {
        if (message[handler]) {
            message[handler] = handlers[handler](message[handler]);
            process.send(message);
            handled = true;
            break;
        }
    }
    if (!handled) {
        message.error = 'unknown message'
        process.send(message);
    }
});
