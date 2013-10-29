"use strict";
var fs = require('fs'),
    mongodb = require('mongodb'),
    GridStore = mongodb.GridStore,
    MongoClient = mongodb.MongoClient,
    Q = require('q');

function MediaStore(config) {
    var self = this;
    var database;
    var connectPromise = Q.defer();

    this.get = function (recordid, name, callback) {
        connectPromise.promise.done(function () {
        });
    };

    this.send = function (recordid, name, res) {
        connectPromise.promise.done(function () {
            var gs = new GridStore(database, recordid + '/' + name, 'r');
            gs.open(function (err, gs) {
                if (err) {
                    res.send(404);
                } else {
                    var stream = gs.stream(true);
                    gs.pipe(res);
                }
            });
        });
    };

    this.save = function (recordid, name, metadata, tmppath, callback) {
        connectPromise.promise.done(function () {
            var gs = new GridStore(database, recordid + '/' + name, 'w', metadata);
            gs.open(function(err, gridStore) {
                gridStore.writeFile(tmppath, function (err) {
                    fs.unlink(tmppath, function () {
                        callback(err);
                    });
                });
            });
        });
    };

    this.del = function (recordid, name, callback) {
        connectPromise.promise.done(function () {
            GridStore.unlink(database, recordid + '/' + name, callback);
        });
    };

    config.mediaconf = config.mediaconf || { };
    if (typeof config.mediaconf.namespace === 'string') {
        self.namespace = config.mediaconf.namespace;
    } else {
        self.namespace = 'biblionarrator';
    }

    MongoClient.connect('mongodb://' + (config.mediaconf.hostname || '127.0.0.1') + '/' + self.namespace, { auto_reconnect: true, readPreference: 'nearest' }, function (err, db) {
        if (err) connectPromise.reject(err);
        database = db;
        connectPromise.resolve(database);
    });
}

module.exports = MediaStore;
