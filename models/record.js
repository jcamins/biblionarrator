var Q = require('q'),
    models,
    datastore = require('../lib/datastore'),
    graphstore = require('../lib/graphstore'),
    g = graphstore(),
    formatters = require('../lib/formats');

module.exports = Record;

function Record(data) {
    var me = this;
    var _v;

    this.v = function () {
        if (typeof _v !== 'undefined') {
            return _v;
        } else if (me._id) {
            return g.v(me._id);
        } else {
            throw('record not saved');
        }
    };

    /*this. in = function(filter) {
        var Link = require('./link');
        var deferred = Q.defer();
        createPromise.promise.then(function(me) {
            datastore.query('SELECT * FROM record_links WHERE target_id = ?', [me.id], function(err, results, fields) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var links = [];
                    for (var idx in results) {
                        links.push(new models.Link(results[idx].source_id, results[idx].target_id, 'In', results[idx].in_label));
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
            datastore.query('SELECT * FROM record_links WHERE source_id = ?', [me.id], function(err, results, fields) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var links = [];
                    for (var idx in results) {
                        links.push(new models.Link(results[idx].source_id, results[idx].target_id, 'Out', results[idx].out_label));
                    }
                    deferred.resolve(links);
                }
            });
        });
        return deferred.promise;
    }; */

    this.save = function () {
        var v;
        if (typeof _v !== 'undefined') {
            v = me._v.iterator().nextSync();
        } else if (typeof me._id !== 'undefined') {
            me._v = g.v(me._id);
            v = me._v.iterator().nextSync();
        } else {
            v = graphstore.getDB().addVertexSync(null);
            _v = g.v(v);
        }
        for (var prop in me) {
            if (me.hasOwnProperty(prop) && typeof me[prop] !== 'function') {
                if (typeof me[prop] === 'object') {
                    v.setPropertySync(prop, JSON.stringify(me[prop]));
                } else {
                    v.setPropertySync(prop, me[prop]);
                }
            }
        }
        me._id = v.getIdSync();
        return me;
    };

    this.snippet = function() {
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        var record = new Record({
            id: me.id,
            data: formatters[me.format].snippet(this.data),
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
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        return formatters[me.format].render(this.data);
    };

    for (var prop in data) {
        if (data.hasOwnProperty(prop) && typeof data[prop] !== 'function') {
            me[prop] = data[prop];
        }
    }

    return this;
}

Record.findOne = function findOne (filter) {
    var one;
    if (filter._id) {
        one = g.v(filter._id).toJSON();
    } else {
        one = g.V(filter).toJSON()[0];
    }
    return new Record(one[0]);
};

Record.findAll = function findAll (filter) {
    var all = g.V(filter).toJSON();
    var records = [ ];
    all.forEach(function (one) {
        records.push(new Record(one));
    });
    return records;
};


Record.init = function(ref) {
    models = ref;
};
