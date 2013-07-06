var sharedview = require('../lib/sharedview'),
    Record = require('../models/record'),
    Field = require('../models/field'),
    RecordType = require('../models/recordtype'),
    Q = require('q');

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
    Q.all([ new Record(req.params.record_id), Field.all(), RecordType.all() ]).then(function (defdata) {
        data.record = defdata[0];
        data.fields = defdata[1];
        data.recordtypes = defdata[2];
        data.record.rendered = Record.render(data.record.data);
        res.render('record/interface', data, function(err, html) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(html);
            }
        });
    });
};
