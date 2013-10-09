"use strict";
var MongoClient = require('mongodb').MongoClient,
    Q = require('q');

function Cache(config) {
    var self = this;
    var cache;
    var database;
    var connectPromise = Q.defer();

    this.get = function (key, callback) {
        connectPromise.promise.done(function () {
            cache.findOne({ _id: key }, function (err, rec) {
                if (rec) {
                    callback(err, JSON.parse(rec.value));
                } else {
                    callback(err, null);
                }
            });
        }, function (err) {
            callback(err, null);
        });
    };

    this.mget = function (keys, callback) {
        connectPromise.promise.done(function () {
            cache.find({ _id: { $in: keys } }).toArray(function (err, recs) {
                var results = new Array(keys.length);
                var lookup = { };
                keys.forEach(function (key, index) {
                    lookup[key] = index;
                });
                if (typeof callback === 'function') {
                    recs.forEach(function (rec) {
                        results[lookup[rec._id]] = JSON.parse(rec.value);
                    });
                    callback(err, results);
                }
            });
        }, function (err) {
            if (typeof callback === 'function') {
                callback(err, null);
            }
        });
    };

    this.set = function (key, value, expiration, callback) {
        var expire = new Date();
        if (expiration) {
            expire.setSeconds(expire.getSeconds() + expiration);
        } else {
            expire.setSeconds(expire.getSeconds() + self.expire);
        }
        connectPromise.promise.done(function () {
            cache.save({ _id: key, value: JSON.stringify(value), expire: expire }, function (err, result) {
                if (typeof callback === 'function') callback(err, result);
            });
        });
    };

    /*jshint unused:false */ /* Not yet implemented */
    this.del = function (key, callback) {
    };
    /*jshint unused:true */

    config.cacheconf = config.cacheconf || { };
    if (typeof config.cacheconf.namespace === 'string') {
        self.namespace = config.cacheconf.namespace;
    } else {
        self.namespace = 'biblionarrator';
    }
    self.expire = config.cacheconf.defaultexpiry || 600;

    MongoClient.connect('mongodb://' + (config.cacheconf.hostname || '127.0.0.1') + '/' + self.namespace, function (err, db) {
        if (err) connectPromise.reject(err);
        database = db;
        database.collection('cache', function (err, collection) {
            cache = collection;
            collection.ensureIndex({ "expire": 1}, { expireAfterSeconds: 0 }, function (err) {
                if (err) {
                    connectPromise.reject(err);
                } else {
                    connectPromise.resolve(true);
                }
            });
        });
    });

    return self;
}

module.exports = Cache;

