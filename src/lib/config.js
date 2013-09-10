var extend = require('extend'),
    searchengine = require('../../config/searchengine');

var schema = { indexes: { }, fields: { }, facets: { } };

searchengine.schemas.unshift('common');
searchengine.schemas.forEach(function (which) {
    var newschema = { };
    try {
        newschema = require('bn-schema-' + which);
        Object.keys(newschema.fields).forEach(function (field) {
            newschema.fields[field].name = field;
            newschema.fields[field].schema = newschema.prefix;
            newschema.fields[field].config = true;
            newschema.fields[field].model = 'Field';
            schema.fields[newschema.prefix + '_' + field] = newschema.fields[field];
            schema.indexes[field] = newschema.fields[field];
            schema.indexes[field].field = newschema.prefix  + '_' + field;
        });
        extend(schema.facets, newschema.facets);
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            console.log('Schema ' + which + ' is not available');
        }
    }
});

module.exports.searchengine = extend(true, searchengine, schema);
