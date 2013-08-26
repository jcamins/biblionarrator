var datastore = require('../lib/datastore'),
    util = require('util');
var inspect = require('eyes').inspector({maxLength: false});

module.exports = DataModel;

function DataModel() {
}

DataModel.prototype.save = function () {
    datastore.set(this.model, this.id, this);
};

DataModel.prototype.del = function () {
    datastore.del(this.model, this.id);
};

DataModel.findOne = function (Model, key, callback) {
    datastore.get(Model.name, key, function (err, results) {
        callback(err, results === null ? null : new Model(results));
    });
};

DataModel.all = function (Model, callback) {
    datastore.get(Model.name, '*', function (err, results) {
        var map = {};
        var list = [];
        for (var idx in results) {
            map[idx] = new Model(results[idx]);
            list.push(map[idx]);
        }
        callback(err, list, map);
    });
};

module.exports.extend = function (Model) {
    util.inherits(Model, DataModel);
    for (var classmethod in DataModel) {
        Model[classmethod] = DataModel[classmethod].bind(Model, Model);
    }
};

