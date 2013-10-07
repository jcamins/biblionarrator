var models,
    extend = require('extend'),
    DataModel = require('../lib/datamodel'),
    environment = require('../lib/environment');

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


    self.save = function () {
        environment.templates[self.id] = self;
        environment.datastore.set(self.model, self.id, self);
    };

    return self;
}

DataModel.extend(Field);

Field.findOne = function (key, callback) {
    DataModel.findOne(Field, key, function (err, model) {
        var field = environment.fields[key];
        if ((err || model === null) && typeof field === 'undefined') {
            callback(err, null);
        }
        field = field || { };
        if (model !== null) {
            extend(true, field, model);
        }
        callback(err, new Field(field));
    });
};

Field.all = function (callback) {
    DataModel.all(Field, function (err, map) {
        var fields = { };
        Object.keys(environment.fields).forEach(function (field) {
            fields[field] = environment.fields[field];
        });
        Object.keys(map).forEach(function (field) {
            if (map[field] !== null) {
                fields[field] = fields[field] || new Field();
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
