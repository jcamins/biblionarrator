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
    var targetpath = '/uploads/' + shasum.digest('hex');
    environment.mediastore.save(req.params.record_id, req.files.media.hash + req.files.media.path.substring(req.files.media.path.lastIndexOf('.')), { type: req.files.media.type }, tmppath, function (err) {
        if (err) {
            res.json({
                'error': err
            });
        } else {
            req.body.description = req.body.description || '';
            var rec = Record.findOne({ id: req.params.record_id });
            rec.addMedia(req.files.media.hash, req.body.description, req.files.media.type, req.files.media.hash + req.files.media.path.substring(req.files.media.path.lastIndexOf('.')));
            rec.save();
            res.json({
                'description': req.body.description,
                'location': targetpath
            });
        }
        fs.unlink(tmppath, function (err) {
        });
    });
};

var mediatypelookup = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

exports.get = function(req, res) {
    environment.mediastore.get(req.params.record_id, req.params.filename, function (err, data) {
        res.set('Content-Type', mediatypelookup[req.params.filename.substring(req.params.filename.lastIndexOf('.'))]);
        res.send(data);
    });
};

exports.del = function(req, res) {
    var rec = Record.findOne({ id: req.params.record_id });
    rec.delMedia(req.params.hash);
    rec.save();
    res.json({
        id: req.params.hash
    });
};
