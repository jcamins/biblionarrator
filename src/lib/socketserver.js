"use strict";
var sockjs = require('sockjs'),
    environment = require('./environment'),
    cache = environment.cache;

var sockjs_server;

var subscriptions = { };


module.exports.configure = function (server) {
    var sockjs_opts = {
        sockjs_url: "/lib/js/sockjs-0.3.min.js",
        log: function (severity, line) {
            if (severity === 'info') {
                environment.accesslog.write("Socket server: " + line + "\n");
            } else {
                environment.errorlog.write("Socket server: " + line + "\n");
            }
        }
    };
    sockjs_server = sockjs.createServer(sockjs_opts);
    sockjs_server.on('connection', function(conn) {
        conn.on('data', function(message) {
            registerSubscription(conn, message);
        });
    });

    sockjs_server.installHandlers(server, {prefix:'/socket'});
};

module.exports.announcePublication = announcePublication;
module.exports.registerSubscription = registerSubscription;

function announcePublication (id, value) {
    if (typeof subscriptions[id] !== 'undefined' && subscriptions[id].length > 0) {
        var message = JSON.stringify({ id: id, data: value });
        subscriptions[id].forEach(function (conn) {
            conn.write(message);
        });
    }
}

function registerSubscription (conn, message) {
    message = JSON.parse(message);
    if (message.register) {
        cache.get(message.register, function (err, res) {
            if (err || res === null) {
                subscriptions[message.register] = subscriptions[message.register] || [ ];
                subscriptions[message.register].push(conn);
            } else {
                conn.write(JSON.stringify({ id: message.register, data: res }));
            }
        });
    }
}
