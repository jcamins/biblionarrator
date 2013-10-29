var environment = require('../lib/environment'),
    crypto = require('crypto'),
    path = require('path'),
    fs = require('fs'),
    qfs = require('q-io/fs'),
    models = require('../models'),
    Record = models.Record;

exports.upload = function(req, res) {
    var shasum = crypto.createHash('sha1');
    shasum.update(req.params.record_id.toString(), 'utf8');
    var tmppath = req.files.media.path;
    var filename = req.files.media.hash + req.files.media.path.substring(req.files.media.path.lastIndexOf('.'));
    environment.mediastore.save(req.params.record_id, filename, { type: req.files.media.type }, tmppath, function (err) {
        if (err) {
            res.json({
                'error': err
            });
        } else {
            req.body.description = req.body.description || '';
            var rec = Record.findOne({ id: req.params.record_id });
            rec.addMedia(filename, req.body.description, req.files.media.type);
            rec.save();
            res.json({
                'description': req.body.description,
            });
        }
    });
};

exports.get = function(req, res) {
    environment.mediastore.send(req.params.record_id, req.params.filename, res);
};

exports.del = function(req, res) {
    var rec = Record.findOne({ id: req.params.record_id });
    rec.delMedia(req.params.hash);
    rec.save();
    res.json({
        id: req.params.hash
    });
};
