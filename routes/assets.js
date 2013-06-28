exports.fieldscss = function(req, res) {
    var connection = require('../lib/datastore.js').connection;
    var data = {
        styles: [],
        fields: []
    };
    connection.query('SELECT styles.css, fields.* FROM styles LEFT JOIN fields ON (styles.field_id = fields.id)', function(err, results, fields) {
        for (var index in results) {
            data.styles.push({
                field: {
                    schema: results[index].schema,
                    field: results[index].field,
                    link: results[index].link
                },
                css: results[index].css
            });
        }
        connection.query('SELECT * FROM fields', function(err, results, fields) {
            for (var index in results) {
                data.fields.push({
                    schema: results[index].schema,
                    field: results[index].field,
                    label: results[index].label
                });
            }
            res.render('../views/fields-css.mustache', data, function(err, css) {
                res.setHeader('Content-Type', 'text/css');
                res.send(css);
            });
        });
    });
};

exports.bndbinitializerjs = function(req, res) {
    var connection = require('../lib/datastore.js').connection;
    var data = {
        styles: [],
        fields: [],
        records: []
    };
    connection.query('SELECT styles.css, fields.* FROM styles LEFT JOIN fields ON (styles.field_id = fields.id)', function(err, results, fields) {
        for (var index in results) {
            data.styles.push({
                field: {
                    schema: results[index].schema,
                    field: results[index].field,
                    link: results[index].link
                },
                css: results[index].css
            });
        }
        connection.query('SELECT * FROM fields', function(err, results, fields) {
            data.fields = results;
            connection.query('SELECT * FROM records', function(err, results, fields) {
                data.records = results;
                res.render('../views/bndb_initializer-js.mustache', {
                    fields: JSON.stringify(data.fields),
                    styles: JSON.stringify(data.styles),
                    records: JSON.stringify(data.records)
                }, function(err, js) {
                    res.setHeader('Content-Type', 'text/javascript');
                    res.send(js);
                });
            });
        });
    });
};
