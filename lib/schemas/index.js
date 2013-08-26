var extend = require('extend'),
    schemas = { };

require("fs").readdirSync(__dirname).forEach(function(file) {
    if (file.indexOf('.js') === file.length - 3 && file !== 'index.js') {
        schemas[file.substring(0, file.length - 3)] = require("./" + file);
    }
});

var schema = {
    indexes: {
        keyword: {
            type: 'text',
            unique: false,
            multivalue: false
        },
        key: {
            type: 'property',
            datatype: 'String',
            unique: true,
            multivalue: false
        },
        recordtype: {
            type: 'edge',
            unidirected: true
        },
        model: {
            type: 'property',
            datatype: 'String',
            unique: false,
            multivalue: false
        },
        linkbrowse: {
            type: 'dbcallback'
        }
    },
    use: useSchema
};

function useSchema(which) {
    if (typeof schemas[which] !== 'undefined') {
        extend(schema.indexes, schemas[which].indexes);
    }
    return schema;
}

module.exports = schema;
