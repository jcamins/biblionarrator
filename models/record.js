var Q = require('q'),
    connection = require('../lib/datastore').connection;

module.exports = Record;

function Record (id) {
    var createPromise = Q.defer();
    var me = this;

    var func_get = function (id) {
        connection.query('SELECT * FROM records WHERE id = ?', [ id ], function (err, results, fields) {
            for (var idx in fields) {
                me[fields[idx].name] = results[0][fields[idx].name];
            }
            if (err) {
                createPromise.reject(err);
            } else {
                createPromise.resolve(me);
            }
        });
    };

    var func_new = function () {
    };

    this.with = function (callback) {
        createPromise.promise.then(callback);
    };

    this.in = function (filter) {
        var Link = require('./link');
        var deferred = Q.defer();
        createPromise.promise.then(function (me) {
            connection.query('SELECT * FROM record_links WHERE target_id = ?', [ me.id ], function (err, results, fields) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var links = [];
                    for (var idx in results) {
                        links.push(new Link(results[idx].source_id, results[idx].target_id));
                    }
                    deferred.resolve(links);
                }
            });
        });
        this.with = function (callback) {
            deferred.promise.then(callback);
        };
        return this;
    };

    this.out = function (filter) {
        var Link = require('./link');
        var deferred = Q.defer();
        createPromise.promise.then(function (me) {
            connection.query('SELECT * FROM record_links WHERE source_id = ?', [ me.id ], function (err, results, fields) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var links = [];
                    for (var idx in results) {
                        links.push(new Link(results[idx].source_id, results[idx].target_id));
                    }
                    deferred.resolve(links);
                }
            });
        });
        this.with = function (callback) {
            deferred.promise.then(callback);
        };
        return this;
    };

    if (id) {
        func_get(id);
    } else {
        func_new();
    }
};
