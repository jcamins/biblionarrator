"use strict";
var MongoClient = require('mongodb').MongoClient,
    Q = require('q');

function DataStore(config) {
    var self = this;
    var database;
    var connectPromise = Q.defer();

    this.wait = function (callback) {
        connectPromise.promise.done(callback);
    };

    this.database = function () {
        return database;
    };

    this.get = function (model, key, callback) {
        connectPromise.promise.done(function () {
            if (key === '*') {
                database.collection(model).find().toArray(function (err, recs) {
                    var results = { };
                    if (recs) {
                        recs.forEach(function (rec) {
                            results[rec._id] = JSON.parse(rec.value);
                        });
                    }
                    callback(err, results);
                });
            } else {
                database.collection(model).findOne({ _id: key }, function (err, rec) {
                    if (rec) {
                        callback(err, JSON.parse(rec.value));
                    } else {
                        callback(err, null);
                    }
                });
            }
        }, function (err) {
            callback(err, null);
        });
    }; 

    this.set = function (model, key, object, callback) {
        connectPromise.promise.done(function () {
            database.collection(model).save({ _id: key, value: JSON.stringify(object) }, function (err, result) {
                if (typeof callback === 'function') callback(err, result);
            });
        });
    };

    this.del = function (model, key, callback) {
        connectPromise.promise.done(function () {
            database.collection(model).remove({ _id: key }, function (err, result) {
                if (typeof callback === 'function') callback(err, result);
            });
        });
    };

    config.dataconf = config.dataconf || { };
    if (typeof config.dataconf.namespace === 'string') {
        self.namespace = config.dataconf.namespace;
    } else {
        self.namespace = 'biblionarrator';
    }

    MongoClient.connect('mongodb://' + (config.dataconf.hostname || '127.0.0.1') + '/' + self.namespace, { auto_reconnect: true, readPreference: 'nearest' }, function (err, db) {
        if (err) connectPromise.reject(err);
        database = db;
        connectPromise.resolve(database);
    });

    return self;
}

module.exports = DataStore;

