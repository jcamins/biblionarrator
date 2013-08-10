var faceter = require('./faceter'),
    searcher = require('./searcher');

process.on('message', function (message) {
    if (message.facet) {
        message.facet = faceter(message.facet);
        process.send(message);
    } else if (message.search) {
        message.search = searcher(message.search);
        process.send(message);
    } else {
        message.error = 'unknown message'
        process.send(message);
    }
});
