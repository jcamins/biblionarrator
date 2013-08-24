var models,
    extend = require('extend'),
    DataModel = require('../lib/datamodel');

module.exports = Field;

function Field (data) {
    var self = this;
    self.model = 'Field'
    extend(self, data);

    Object.defineProperties(self, {
        "id": {
            "get": function () { return (self.schema || '') + '_' + (self.field || ''); }
        }
    });

    return self;
}

DataModel.extend(Field);

Field.init = function (ref) {
    models = ref;
};
