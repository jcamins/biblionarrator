var models,
    extend = require('extend'),
    DataModel = require('../lib/datamodel'),
    searchengine = require('../lib/config').searchengine;

module.exports = Field;

function Field (data) {
    var self = this;
    self.model = 'Field';
    extend(self, data);

    Object.defineProperties(self, {
        "id": {
            "get": function () { return (self.schema || '') + '_' + (self.name || ''); }
        }
    });

    return self;
}

DataModel.extend(Field);

Field.findOne = function (key, callback) {
    DataModel.findOne(Field, key, function (err, model) {
        var field = searchengine.fields[key] || { };
        if (model !== null) {
            extend(true, field, model);
        }
        callback(err, new Field(field));
    });
};

Field.all = function (callback) {
    DataModel.all(Field, function (err, list, map) {
        var fields = { };
        Object.keys(searchengine.fields).forEach(function (field) {
            fields[field] = searchengine.fields[field];
        });
        Object.keys(map).forEach(function (field) {
            if (map[field] !== null) {
                fields[field] = fields[field] || { };
                extend(true, fields[field], map[field]);
            }
        });
        Object.keys(fields).forEach(function (field) {
            if (fields[field].system === true) {
                delete fields[field];
            }
        });
        if (typeof callback === 'function') {
            callback(err, fields);
        }
    });
};

Field.init = function (ref) {
    models = ref;
};
