var Q = require('q'),
    models,
    datastore = require('../lib/datastore');

module.exports = Link;

/*jshint unused:false */ /* Not fully implemented */
function Link(source_id, target_id, type, label) {
    var deferred = Q.defer();
    var me = this;
    var source;
    var target;
    type = type || '';

    this.source_id = source_id;
    this.target_id = target_id;
    this.type = type;
    this.label = label;

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
                datastore.query('UPDATE record_links SET source_id = ?, target_id = ?, updated_at = NOW()', [me.source_id, me.target_id], function(err, results) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(true);
                    }
                });
            } else {
                datastore.query('INSERT INTO record_links (source_id, target_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', [me.source_id, me.target_id], function(err, results) {
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
/*jshint unused:true */

Link.init = function(ref) {
    models = ref;
};
