var sockjs = require('sockjs'),
    sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var sockjs_server;

var subscriptions = { },
    publications = { };


module.exports.configure = function (server) {
    sockjs_server = sockjs.createServer(sockjs_opts);
    sockjs_server.on('connection', function(conn) {
        conn.on('data', function(message) {
            registerSubscription(conn, message);
        });
    });

    sockjs_server.installHandlers(server, {prefix:'/socket'});
};

module.exports.registerPublication = registerPublication;
module.exports.registerSubscription = registerSubscription;

function registerPublication (message) {
    var publication = JSON.stringify(message);
    if (subscriptions[message.id]) {
        subscriptions[message.id].write(publication);
    } else {
        publications[message.id] = publication;
        setTimeout(function () {
            delete publications[message.id];
        }, 10000);
    }
}

function registerSubscription (conn, message) {
    message = JSON.parse(message);
    if (message.register) {
        if (publications[message.register]) {
            conn.write(publications[message.register]);
        } else {
            subscriptions[message.register] = conn;
            setTimeout(function () {
                delete subscriptions[message.id];
            }, 10000);
        }
    }
}
