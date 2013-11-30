"use strict";
var handlers = { };
require("fs").readdirSync(__dirname + '/tasks').forEach(function(file) {
    if (file.indexOf('.js') === file.length - 3 && file !== 'index.js') {
        var handler = require("./tasks/" + file);
        handlers[handler.message] = handler;
    }
});
module.exports = function (action, options, callback) {
    handlers[action](options, function (results) {
        var message = { };
        message[action] = results;
        callback(message);
    });
};
