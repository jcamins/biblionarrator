var extend = require('extend'),
    queryparser = require('queryparser');

var config = { };
var environment = { };

process.on('message', function (message) {
    if (typeof message.setEnv !== 'undefined') {
        config = message.setEnv;
        reloadEnvironment();
    }
});

function reloadEnvironment() {
    environment = config;
    environment.fields = environment.fields || { };
    environment.indexes = environment.indexes || { };
    environment.facets = environment.facets || { };
    environment.schemas.unshift('common');
    environment.schemas.forEach(function (which) {
        var newschema = { };
        try {
            newschema = require('bn-schema-' + which);
            Object.keys(newschema.fields).forEach(function (field) {
                newschema.fields[field].name = field;
                newschema.fields[field].schema = newschema.prefix;
                newschema.fields[field].config = true;
                newschema.fields[field].model = 'Field';
                environment.fields[newschema.prefix + '_' + field] = newschema.fields[field];
                environment.indexes[field] = newschema.fields[field];
                environment.indexes[field].field = newschema.prefix  + '_' + field;
            });
            extend(environment.facets, newschema.facets);
        } catch (e) {
            if (e.code === 'MODULE_NOT_FOUND') {
                console.log('Schema ' + which + ' is not available');
            }
        }
    });
    queryparser.initialize(environment);
    module.exports = environment;
}

module.exports = environment;

module.exports.load = function loadConfig(file) {
    config = require(file);
    reloadEnvironment();
};
