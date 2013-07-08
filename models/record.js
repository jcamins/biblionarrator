var Q = require('q'),
    models,
    connection = require('../lib/datastore').connection,
    bnjson = require('../lib/formats/bnjson');

module.exports = Record;

function Record(data) {
    var createPromise = Q.defer();
    var me = this;

    this.with = function(callback) {
        createPromise.promise.then(callback);
    };

    this. in = function(filter) {
        var Link = require('./link');
        var deferred = Q.defer();
        createPromise.promise.then(function(me) {
            connection.query('SELECT * FROM record_links WHERE target_id = ?', [me.id], function(err, results, fields) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var links = [];
                    for (var idx in results) {
                        links.push(new models.Link(results[idx].source_id, results[idx].target_id, 'In'));
                    }
                    deferred.resolve(links);
                }
            });
        });
        return deferred.promise;
    };

    this.out = function(filter) {
        var Link = require('./link');
        var deferred = Q.defer();
        createPromise.promise.then(function(me) {
            connection.query('SELECT * FROM record_links WHERE source_id = ?', [me.id], function(err, results, fields) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var links = [];
                    for (var idx in results) {
                        links.push(new models.Link(results[idx].source_id, results[idx].target_id, 'Out'));
                    }
                    deferred.resolve(links);
                }
            });
        });
        return deferred.promise;
    };

    this.save = function() {
        var savePromise = Q.defer();
        createPromise.promise.then(function(me) {
            var query;
            if (me.id) {
                query = 'UPDATE records SET data = ?, recordtype_id = ? WHERE id = ?';
            } else {
                query = 'INSERT INTO records (data, recordtype_id) VALUES (?, ?)';
                me.id = '';
            }
            connection.query(query, [me.data, me.recordtype_id, me.id], function(err, results) {
                if (err) {
                    savePromise.reject(err);
                } else {
                    if (!me.id) {
                        me.id = results.insertId;
                    }
                    savePromise.resolve(me);
                }
            });
        });
        return savePromise.promise;
    };

    this.snippet = function() {
        var deferred = Q.defer();
        createPromise.promise.then(function(me) {
            var record = new Record({
                id: me.id,
                data: JSON.stringify(bnjson.snippet(JSON.parse(me.data))),
                recordtype_id: me.recordtype_id
            });
            deferred.resolve(record);
        });
        return deferred.promise;
    };

    this.render = function() {
        if (typeof this.data === 'undefined' || this.data === null || this.data === '') {
            return '<article><header></header><section></section></article>';
        }
        return bnjson.render(JSON.parse(this.data));
    };

    if (typeof data === 'object') {
        for (var idx in data) {
            me[idx] = data[idx];
        }
        createPromise.resolve(me);
    } else if (data !== 'new' && (typeof data === 'string' || typeof data === 'number')) {
        connection.query('SELECT records.*, recordtypes.name AS recordtype FROM records LEFT JOIN recordtypes ON (recordtypes.id=records.recordtype_id) WHERE records.id = ?', [data], function(err, results, fields) {
            if (err) {
                createPromise.reject(err);
            } else {
                if (results.length > 0) {
                    for (var idx in fields) {
                        me[fields[idx].name] = results[0][fields[idx].name];
                    }
                }
                createPromise.resolve(me);
            }
        });
    } else {
        createPromise.resolve(me);
    }
    return createPromise.promise;
}

Record.init = function(ref) {
    models = ref;
};
