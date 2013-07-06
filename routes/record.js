var sharedview = require('../lib/sharedview'),
    models = require('../models');
    Record = models.Record,
    Field = models.Field,
    RecordType = models.RecordType,
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
    var record = new Record(req.params.record_id);
    if (req.accepts('application/json')) {
        record.then(function (rec) {
            res.json(rec);
        });
    } else {
        Q.all([ sharedview(), record, Field.all(), RecordType.all() ]).then(function (defdata) {
            var data = defdata[0];
            data.record = defdata[1];
            data.fields = defdata[2];
            data.recordtypes = defdata[3];
            data.record.rendered = data.record.render();
            res.render('record/interface', data, function(err, html) {
                if (err) {
                    res.send(404, err);
                } else {
                    res.send(html);
                }
            });
        }, function (errs) {
            console.log(errs);
        });
    }
};

exports.snippet = function (req, res) {
    var record = new Record(req.params.record_id);
    //if (req.accepts('application/json')) {
        record.then(function (rec) {
            return rec.snippet();
        }).then(function (snippet) {
            res.json(snippet);
        });
    //}
};

exports.save = function (req, res) {
    req.body.recordtype_id = req.body.recordtype_id || 1;
    var record = new Record({ id: req.params.record_id,
                              data: req.body.data,
                              recordtype_id: req.body.recordtype_id });
    record.then(function (rec) {
        return rec.save();
    }).then(function (rec) {
        res.send(JSON.stringify(rec));
    }, function (err) {
        res.send(404, err);
    });
};
