var models,
    extend = require('extend'),
    DataModel = require('../lib/datamodel'),
    environment = require('../lib/environment');

module.exports = Template;

function Template (data) {
    var self = this;
    self.model = 'Template';
    extend(self, data);

    self.save = function () {
        environment.templates[self.id] = self;
        datastore.set(self.model, self.id, self);
    };

    return self;
}

DataModel.extend(Template);

Template.findOne = function (key, callback) {
    if (environment.templates[key]) {
        callback(null, new Template(environment.templates[key]));
    } else {
        callback(null, null);
    }
};

Template.all = function (callback) {
    var templates = { };
    for (var key in environment.templates) {
        templates[key] = new Template(environment.templates[key]);
    }
    callback(null, templates);
};

Template.init = function (ref) {
    models = ref;
};

