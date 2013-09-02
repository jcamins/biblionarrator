"use strict";
var redis = require('redis'),
    client = redis.createClient();

var namespace = '';
module.exports.namespace = function (ns) {
    if (typeof ns === 'undefined') {
        return namespace;
    } else {
        namespace = ns + '|';
    }
};

module.exports.get = function (model, key, callback) {
    if (key === '*') {
        client.hgetall(namespace + model, function (err, results) {
            for (var member in results) {
                results[member] = JSON.parse(results[member]);
            }
            callback(err, results);
        });
    } else {
        client.hget(namespace + model, key, function (err, results) {
            callback(err, JSON.parse(results));
        });
    }
}; 
module.exports.set = function (model, key, object) {
    client.hset(namespace + model, key, JSON.stringify(object));
};

module.exports.del = function (model, key) {
    client.hdel(namespace + model, key);
};

