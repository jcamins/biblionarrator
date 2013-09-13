"use strict";
var redis = require('redis');

function DataStore(config) {
    var self = this;
    var client = redis.createClient();

    client.on('error', function (err) {
        console.log("Non-fatal datastore error: " + err);
    });

    this.get = function (model, key, callback) {
        if (key === '*') {
            client.hgetall(self.namespace + model, function (err, results) {
                for (var member in results) {
                    results[member] = JSON.parse(results[member]);
                }
                callback(err, results);
            });
        } else {
            client.hget(self.namespace + model, key, function (err, results) {
                callback(err, JSON.parse(results));
            });
        }
    }; 

    this.set = function (model, key, object) {
        client.hset(self.namespace + model, key, JSON.stringify(object));
    };

    this.del = function (model, key) {
        client.hdel(self.namespace + model, key);
    };

    this.client = function () {
        return client;
    };

    config.dataconf = config.dataconf || { };
    if (typeof config.dataconf.namespace === 'string') {
        self.namespace = config.dataconf.namespace + '|';
    } else {
        self.namespace = '';
    }
    return self;
}

module.exports = DataStore;
