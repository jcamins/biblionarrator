"use strict";
var redis = require('redis');

function Cache(config) {
    var self = this;
    var client = redis.createClient();

    client.on('error', function (err) {
        console.log("Non-fatal cache error: " + err);
    });

    this.get = function (key, callback) {
        client.get(self.namespace + key, function (err, value) {
            value = JSON.parse(value);
            if (typeof callback === 'function') {
                callback(err, value);
            }
        });
    };

    this.mget = function (keys, callback) {
        var nkeys = [ ];
        keys.forEach(function (item) {
            nkeys.push(self.namespace + item);
        });
        client.mget(keys, function (err, values) {
            for (var ii = 0; ii < values.length; ii++) {
                values[ii] = JSON.parse(values[ii]);
            }
            if (typeof callback === 'function') {
                callback(err, values);
            }
        });
    };

    this.set = function (key, value, expiration, callback) {
        value = JSON.stringify(value);
        client.set(self.namespace + key, value, function (err, reply) {
            if (expiration > 0) {
                client.expire(self.namespace + key, expiration);
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

    config.cacheconf = config.cacheconf || { };
    if (typeof config.cacheconf.namespace === 'string') {
        self.namespace = config.cacheconf.namespace + '|';
    } else {
        self.namespace = '';
    }

    return self;
}

module.exports = Cache;
