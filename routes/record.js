var sharedview = require('../lib/sharedview'),
    Record = require('../models/record');

exports.linkselect = function (req, res) {
    res.render('link-select', { id: req.params.record_id, layout: false }, function(err, html) {
        res.send(html);
    });
};

exports.linkadd = function (req, res) {
    var connection = require('../lib/datastore.js').connection;

    connection.query('INSERT INTO record_links (source_id, target_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', [req.params.record_id, req.params.target_id], function (err, results) {
        if (err) {
            res.json({ error: err });
        } else {
            res.json({ success: true });
        }
    });
};

exports.linklist = function (req, res) {
};

exports.view = function (req, res) {
    var connection = require('../lib/datastore.js').connection;
    var data = sharedview();
    connection.query('SELECT * FROM fields', function(err, results, fields) {
        data.fields = results;
        connection.query('SELECT id, name FROM recordtypes', function(err, results, fields) {
            data.recordtypes = results;
            connection.query('SELECT records.id, recordtypes.name AS recordtype, records.data FROM records LEFT JOIN recordtypes ON (recordtypes.id=records.recordtype_id) WHERE records.id = ?', [ req.params.record_id ], function(err, results, fields) {
                data.record = results[0];
                data.record.rendered = Record.render(data.record.data);
                res.render('record/interface', data, function(err, html) {
                    if (err) {
                        res.send(404, err);
                    } else {
                        res.send(html);
                    }
                });
            });
        });
    });
};
