var faceter = require('./faceter');

process.on('message', function (message) {
    if (message.facet) {
        message.facet = faceter(message.facet);
        process.send(message);
    }
});
