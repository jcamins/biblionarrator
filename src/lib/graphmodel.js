"use strict";
var util = require('util'),
    extend = require('extend'),
    environment = require('./environment'),
    graphstore = environment.graphstore,
    T = graphstore.g.Tokens,
    async = require('async');

module.exports = GraphModel;

function GraphModel () {
}

GraphModel.findOne = function findOne (Model, filter, callback) {
    Model.findAll(filter, function (err, model) {
        if (!model || !model[0]) return callback(err, null);
        callback(err, model[0]);
    });
};

GraphModel.findAll = function findAll (Model, filter, callback) {
    if (filter.id) {
        graphstore.g.v(filter.id, function (err, recs) {
            if (util.isArray(recs)) {
                var array = new graphstore.g.ArrayList();
                for (var ii = 0; ii < recs.length; ii++) {
                    array.addSync(recs[ii].el);
                }
                recs = array;
            }
            graphstore.gremlin.toJSON(recs, function (err, all) {
                callback(err, Model.fromJSON(all));
            });
        });
    } else {
        filter.model = Model.model;
        var pipe = graphstore.g.V();
        for (var key in filter) {
            pipe = pipe.has(key, filter[key]);
        }
        pipe.has('deleted', filter.deleted ? T.eq : T.neq, 1).toJSON(function (err, all) {
            callback(err, Model.fromJSON(all));
        });
    }
};

GraphModel.fromJSON = function (Model, all) {
    if (util.isArray(all)) {
        var models = [ ];
        all.forEach(function (one) {
            models.push(new Model(one));
        });
        return models;
    } else {
        return new Model(all);
    }
};

GraphModel.prototype.v = function (create, callback) {
    var self = this;
    if (this.id) {
        graphstore.g.getVertex(this.id, function (err, v) {
            if (v) return callback.apply(this, arguments);
            if (create) graphstore.g.addVertex(null, callback);
        });
    } else if (create) {
        graphstore.g.addVertex(null, callback);
    } else {
        callback(undefined, undefined);
    }
};

GraphModel.prototype.suppress = function (callback) {
    this.v(false, function (err, v) {
        if (v) {
            retry(3, 5, v.setProperty.bind(v, 'deleted', 1), function (err, res) {
                if (graphstore.autocommit) {
                    graphstore.g.commit(callback);
                }
            });
        }
    });
};

GraphModel.prototype.destroy = function (callback) {
    this.v(false, function (err, v) {
        if (v) {
            v.remove(function (err, res) {
                if (graphstore.autocommit && typeof err === 'undefined') {
                    graphstore.g.commit(callback);
                } else {
                    calback(err, res);
                }
            });
        }
    });
};

GraphModel.prototype.initialize = function (data) {
    extend(this, data);
    if (typeof this.id === 'undefined') {
        this.id = this._id;
    }
    if (typeof this.id === 'string') {
        this.id = this.id.replace('#', '');
    }
};

GraphModel.prototype.save = function (callback) {
    var self = this;
    this.v(true, function (err, v) {
        if (v) {
            var oldprops = { };
            async.series({
                vorder: function (cb) {
                    graphstore.g.start(v).both().count(cb);
                },
                props: function (cb) {
                    v.el.getPropertyKeys(function (err, props) {
                        if (props) {
                            props.toArray(cb)
                        } else {
                            cb(null, []);
                        }
                    });
                }
            },
            function (err, results) {
                var oldprops = { };
                self.vorder = parseInt(results.vorder, 10) || 0;
                results.props = results.props || [ ];
                results.props.forEach(function (prop) {
                    if (prop.substring(0, 1) !== '_') oldprops[prop] = true;
                });
                self.deleted = self.deleted || 0;
                var oparray = [ ];
                var props = { };
                for (var prop in self) {
                    if (prop !== 'id' && self.hasOwnProperty(prop) && typeof self[prop] !== 'function' && typeof self[prop] !== 'undefined') {
                        props[prop] = _isObject(self[prop]) ?  JSON.stringify(self[prop]) : self[prop];
                        if (oldprops[prop]) delete oldprops[prop];
                    }
                }
                async.series([
                    retry.bind(null, 3, 5, v.setProperties.bind(v, props)),
                    retry.bind(null, 3, 5, v.removeProperties.bind(v, Object.keys(oldprops)))
                ], function (err, res) {
                    self.id = v.getId(); // TODO: handle Orient, where ID changes after commit
                    if (graphstore.autocommit) {
                        graphstore.g.commit(function (err) {
                            callback(err, self);
                        });
                    } else {
                        callback(err, self);
                    }
                });
            });
        } else {
            callback(err, undefined);
        }
    });
    return self;
};

/**
 * Link the model to another model
 * @param {string} type type of link to create
 * @param {GraphModel|string} target GraphModel(-extending) object or ID of record to link to
 */
GraphModel.prototype.link = function (type, target, properties, reverse, callback) {
    if (typeof target === 'undefined' || target === null || target === '') {
        callback();
    }
    this.v(false, function (err, sv) {
        graphstore.g.getVertex(typeof target === 'string' || typeof target === 'number' ? target : target.id, function (err, tv) {
            if (err) return callback(err, null);
            graphstore.g.addEdge(null, reverse ? tv : sv, reverse ? sv : tv, type, function (err, edge) {
                var props = { };
                if (typeof properties === 'object' && properties !== null) {
                    for (var prop in properties) {
                        if (prop !== 'id' && properties.hasOwnProperty(prop) && typeof properties[prop] !== 'function' && typeof properties[prop] !== 'undefined') {
                            props[prop] = _isObject(properties[prop]) ?  JSON.stringify(properties[prop]) : properties[prop];
                        }
                    }
                }
                async.parallel([
                    retry.bind(null, 3, 5, sv.incrementProperty.bind(sv, 'vorder')),
                    retry.bind(null, 3, 5, tv.incrementProperty.bind(tv, 'vorder')),
                    retry.bind(null, 3, 5, edge.setProperties.bind(edge, props))
                ], function (err, res) {
                    if (err) console.log(err);
                    if (graphstore.autocommit) {
                        graphstore.g.commit(callback);
                    } else {
                        callback();
                    }
                });
            });
        });
    });
};

function retry (times, pause, method, callback) {
    var queue = [ ];
    for (var ii = 0; ii < times; ii++) {
        queue.push(method);
    }
    var run = function () {
        method = queue.shift();
        method(function (err, res) {
            if (!err || queue.length === 0) return callback.apply(this, arguments);
            setTimeout(function () {
                run();
            }, pause);
        });
    };
    run();
}


/*jshint unused:false */ /* Not yet implemented */
function aclMiddleeware(req, res, Model, action) {
    if (action === 'create') {
    } else {
        if (req.params[Model.model + '_id']) {
            var model = Model.findOne({ id: req.params[Model.model + '_id'] });
        }
    }
}
/*jshint unused:true */

module.exports.extend = function (Model) {
    util.inherits(Model, GraphModel);
    for (var classmethod in GraphModel) {
        Model[classmethod] = GraphModel[classmethod].bind(Model, Model);
    }
};

function _isObject(o) {
    return typeof o === 'object';
}
