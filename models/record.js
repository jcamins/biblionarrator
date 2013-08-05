var Q = require('q'),
    models,
    datastore = require('../lib/datastore'),
    graphstore = require('../lib/graphstore'),
    g = graphstore(),
    T = g.Tokens,
    formatters = require('../lib/formats');

module.exports = Record;

function Record(data) {
    var me = this;

    this.v = function () {
        if (me.id) {
            return g.v(me.id);
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

    this.suppress = function () {
        var v = me.v().iterator().nextSync();
        v.setPropertySync('deleted', 1);
        graphstore.getDB().commitSync();
    };

    this.destroy = function () {
        var v = me.v().iterator().nextSync();
        v.removeSync();
        graphstore.getDB().commitSync();
    };

    this.save = function () {
        var v;
        try {
            v = me.v().iterator().nextSync();
            if (v === null) {
                throw('invalid id');
            }
        } catch (e) {
            v = graphstore.getDB().addVertexSync(null);
        }
        if (typeof me.deleted === 'undefined') {
            me.deleted = 0;
        }
        for (var prop in me) {
            if (prop !== 'id' && me.hasOwnProperty(prop) && typeof me[prop] !== 'function' && typeof me[prop] !== 'undefined') {
                if (typeof me[prop] === 'object') {
                    v.setPropertySync(prop, JSON.stringify(me[prop]));
                } else {
                    v.setPropertySync(prop, me[prop]);
                }
            }
        }
        graphstore.getDB().commitSync();
        me.id = v.toString();
        me.id = me.id.replace(/^v\[#?/, '');
        me.id = me.id.replace(/\]$/, '');
        return me;
    };

    this.snippet = function() {
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        return record = new Record({
            id: me.id,
            data: formatters[me.format].snippet(this.data),
            recordtype_id: me.recordtype_id
        });
    };

    this.render = function() {
        if (typeof me.data === 'undefined' || me.data === null || me.data === '') {
            return '<article><header></header><section></section></article>';
        }
        if (typeof me.data === 'string') {
            me.data = JSON.parse(me.data);
        }
        console.log(me);
        return formatters[me.format].render(me.data);
    };

    this.link = function (type, target) {
        var source = g.v(me.id).iterator().nextSync();
        var targ = g.v(target.id).iterator().nextSync();
        var edge = graphstore.getDB().addEdgeSync(null, source, targ, type);
        graphstore.getDB().commitSync();
    };

    for (var prop in data) {
        if (data.hasOwnProperty(prop) && typeof data[prop] !== 'function') {
            me[prop] = data[prop];
        }
    }
    if (typeof me.id === 'undefined') {
        me.id = me._id;
    }

    return this;
}

Record.findOne = function findOne (filter) {
    return Record.findAll(filter)[0];
};

Record.findAll = function findAll (filter) {
    var all;
    try {
        if (filter.id) {
            all = g.v(filter.id).has('deleted', filter.deleted ? T.eq : T.neq, 1).toJSON();
        } else {
            all = g.V(filter).has('deleted', filter.deleted ? T.eq : T.neq, 1).toJSON();
        }
    } catch (e) {
        all = [ ];
    }
    var records = [ ];
    all.forEach(function (one) {
        records.push(new Record(one));
    });
    return records;
};


Record.init = function(ref) {
    models = ref;
};
