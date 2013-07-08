var Q = require('q'),
    models,
    connection = require('../lib/datastore').connection;

module.exports = Link;

function Link(source_id, target_id, type) {
    var deferred = Q.defer();
    var me = this;
    var source;
    var target;
    type = type || '';

    this.source_id = source_id;
    this.target_id = target_id;
    this.type = type;

    this.source = function() {
        source = source || new models.Record(me.source_id);
        return source;
    };

    this.target = function() {
        target = target || new models.Record(me.target_id);
        return target;
    };

    this.save = function() {
        deferred.promise.then(function() {
            if (me.id) {
                connection.query('UPDATE record_links SET source_id = ?, target_id = ?, updated_at = NOW()', [me.source_id, me.target_id], function(err, results) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(true);
                    }
                });
            } else {
                connection.query('INSERT INTO record_links (source_id, target_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', [me.source_id, me.target_id], function(err, results) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(true);
                    }
                });
            }
        });
    };

    this.with = function(callback) {
        deferred.promise.then(callback);
    };
}

Link.init = function(ref) {
    models = ref;
};
