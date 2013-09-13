"use strict";
var redis = require('redis');

function Cache(config) {
    var self = this;
    var client = redis.createClient();

    client.on('error', function (err) {
        console.log("Non-fatal cache error: " + err);
    });

    this.get = function (key, callback) {
        client.get(key, function (err, value) {
            value = JSON.parse(value);
            if (typeof callback === 'function') {
                callback(err, value);
            }
        });
    };

    this.set = function (key, value, expiration, callback) {
        value = JSON.stringify(value);
        client.set(key, value, function (err, reply) {
            if (expiration > 0) {
                client.expire(key, expiration);
            }
            if (typeof callback === 'function') {
                callback(err, reply);
            }
        });
    };

    /*jshint unused:false */ /* Not yet implemented */
    this.del = function (key, callback) {
    };
    /*jshint unused:true */

    return self;
}

module.exports = Cache;
