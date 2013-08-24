"use strict";
var redis = require('redis'),
    client = redis.createClient();

module.exports.get = function (model, key, callback) {
    if (key === '*') {
        client.hgetall(model, function (err, results) {
            for (var member in results) {
                results[member] = JSON.parse(results[member]);
            }
            callback(err, results);
        });
    } else {
        client.hget(model, key, function (err, results) {
            callback(err, JSON.parse(results));
        });
    }
};

module.exports.set = function (model, key, object) {
    client.hset(model, key, JSON.stringify(object));
};

module.exports.del = function (model, key) {
    client.hdel(model, key);
};
