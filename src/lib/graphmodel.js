"use strict";
var util = require('util'),
    extend = require('extend'),
    graphstore = require('./environment').graphstore,
    g = graphstore.g,
    T = g.Tokens;

module.exports = GraphModel;

function GraphModel () {
}

GraphModel.findOne = function findOne (Model, filter) {
    return Model.findAll(filter)[0];
};

GraphModel.findAll = function findAll (Model, filter) {
    var all;
    try {
        if (filter.id) {
            all = g.v(filter.id).has('deleted', filter.deleted ? T.eq : T.neq, 1).toJSON();
        } else {
            filter.model = Model.model;
            all = g.V(filter).has('deleted', filter.deleted ? T.eq : T.neq, 1).toJSON();
        }
    } catch (e) {
        all = [ ];
    }
    return Model.fromJSON(all);
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

GraphModel.prototype.v = function () {
    if (this.id) {
        return g.v(this.id);
    } else {
        throw('model not saved');
    }
};

GraphModel.prototype.suppress = function () {
    var v = this.v().iterator().nextSync();
    v.setPropertySync('deleted', 1);
    if (graphstore.autocommit) {
        graphstore.db.commitSync();
    }
};

GraphModel.prototype.destroy = function () {
    var v = this.v().iterator().nextSync();
    v.removeSync();
    if (graphstore.autocommit) {
        graphstore.db.commitSync();
    }
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

GraphModel.prototype.save = function () {
    var v, created = false, oldprops = { };
    try {
        v = this.v().iterator().nextSync();
        if (v === null) {
            throw('invalid id');
        }
        this.vorder = parseInt(this.v().both().count(), 10);
        v.getPropertyKeysSync().toArraySync().forEach(function (prop) {
            if (prop.substring(0, 1) !== '_') oldprops[prop] = true;
        });
    } catch (e) {
        created = true;
        v = graphstore.db.addVertexSync(null);
        this.vorder = 0;
    }
    if (typeof this.deleted === 'undefined') {
        this.deleted = 0;
    }
    try { 
        for (var prop in this) {
            if (prop !== 'id' && this.hasOwnProperty(prop) && typeof this[prop] !== 'function' && typeof this[prop] !== 'undefined') {
                if (typeof this[prop] === 'object') {
                    v.setPropertySync(prop, JSON.stringify(this[prop]));
                } else {
                    v.setPropertySync(prop, this[prop]);
                }
                if (oldprops[prop]) delete oldprops[prop];
            }
        }
        for (prop in oldprops) {
            v.removePropertySync(prop);
        }
    } catch (e) {
        if (graphstore.autocommit) {
            graphstore.db.rollbackSync();
        } else if (created === false) {
            graphstore.db.removeVertexSync(v);
        }
        throw (e);
    }
    if (graphstore.autocommit) {
        graphstore.db.commitSync();
    }
    this.id = v.toString();
    this.id = this.id.replace(/^v\[#?/, '');
    this.id = this.id.replace(/\]$/, '');
    return this;
};

/**
 * Link the model to another model
 * @param {string} type type of link to create
 * @param {GraphModel|string} target GraphModel(-extending) object or ID of record to link to
 */
this.link = function (type, target, properties, reverse) {
    try {
        if (typeof target === 'undefined' || target === null || target === '') {
            return;
        }
        var sv = g.v(this.id).iterator().nextSync();
        var tv = g.v(typeof target === 'string' || typeof target === 'number' ? target : target.id).iterator().nextSync();
        var edge;
        if (reverse) {
            edge = graphstore.db.addEdgeSync(null, tv, sv, type);
        } else {
            edge = graphstore.db.addEdgeSync(null, sv, tv, type);
        }
        if (typeof properties === 'object' && properties !== null) {
            for (var prop in properties) {
                if (properties.hasOwnProperty(prop) && typeof properties[prop] !== 'function' && typeof properties[prop] !== 'undefined') {
                    if (typeof properties[prop] === 'object') {
                        edge.setPropertySync(prop, JSON.stringify(properties[prop]));
                    } else {
                        edge.setPropertySync(prop, properties[prop]);
                    }
                }
            }
        }
        sv.setPropertySync('vorder', sv.getPropertySync('vorder') + 1);
        tv.setPropertySync('vorder', tv.getPropertySync('vorder') + 1);
        if (graphstore.autocommit) {
            graphstore.db.commitSync();
        }
    } catch (e) {
        console.log("Error creating link", e, e.stack);
        return;
    }
};


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

