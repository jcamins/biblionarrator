exports.fieldscss = function(req, res) {
    var datastore = require('../lib/datastore.js');
    var data = {
        styles: [],
        fields: []
    };
    datastore.query('SELECT styles.css, fields.* FROM styles LEFT JOIN fields ON (styles.field_id = fields.id)', function(err, results, fields) {
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
        datastore.query('SELECT * FROM fields', function(err, results, fields) {
            for (var index in results) {
                data.fields.push({
                    schema: results[index].schema,
                    field: results[index].field,
                    label: results[index].label
                });
            }
            data.layout = false;
            res.render('fields-css', data, function(err, css) {
                res.setHeader('Content-Type', 'text/css');
                res.send(css);
            });
        });
    });
};

exports.bndbinitializerjs = function(req, res) {
    var datastore = require('../lib/datastore.js');
    var data = {
        styles: [],
        fields: [],
        records: []
    };
    datastore.query('SELECT styles.css, fields.* FROM styles LEFT JOIN fields ON (styles.field_id = fields.id)', function(err, results, fields) {
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
        datastore.query('SELECT * FROM fields', function(err, results, fields) {
            data.fields = results;
            datastore.query('SELECT * FROM records', function(err, results, fields) {
                data.records = results;
                res.render('bndb_initializer-js.handlebars', {
                    fields: JSON.stringify(data.fields),
                    styles: JSON.stringify(data.styles),
                    records: JSON.stringify(data.records),
                    layout: false,
                }, function(err, js) {
                    res.setHeader('Content-Type', 'text/javascript');
                    res.send(js);
                });
            });
        });
    });
};
