"use strict";
var util = require('util'),
    extend = require('extend'),
    graphstore = require('bngraphstore'),
    g = graphstore(),
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
        graphstore.getDB().commitSync();
    }
};

GraphModel.prototype.destroy = function () {
    var v = this.v().iterator().nextSync();
    v.removeSync();
    if (graphstore.autocommit) {
        graphstore.getDB().commitSync();
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
    var v;
    try {
        v = this.v().iterator().nextSync();
        if (v === null) {
            throw('invalid id');
        }
        this.vorder = parseInt(this.v().both().count(), 10);
    } catch (e) {
        v = graphstore.getDB().addVertexSync(null);
        this.vorder = 0;
    }
    if (typeof this.deleted === 'undefined') {
        this.deleted = 0;
    }
    for (var prop in this) {
        if (prop !== 'id' && this.hasOwnProperty(prop) && typeof this[prop] !== 'function' && typeof this[prop] !== 'undefined') {
            if (typeof this[prop] === 'object') {
                v.setPropertySync(prop, JSON.stringify(this[prop]));
            } else {
                v.setPropertySync(prop, this[prop]);
            }
        }
    }
    if (graphstore.autocommit) {
        graphstore.getDB().commitSync();
    }
    this.id = v.toString();
    this.id = this.id.replace(/^v\[#?/, '');
    this.id = this.id.replace(/\]$/, '');
    return this;
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

