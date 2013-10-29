var environment = require('../lib/environment'),
    models = require('../models'),
    Record = models.Record;

exports.upload = function(req, res) {
    var filename = req.files.media.hash + req.files.media.path.substring(req.files.media.path.lastIndexOf('.'));
    environment.mediastore.save(req.params.record_id, filename, { content_type: req.files.media.type }, req.files.media.path, function (err) {
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
    rec.delMedia(req.params.filename);
    rec.save();
    environment.mediastore.del(req.params.record_id, req.params.filename, function () {
        res.json({
            id: req.params.filename
        });
    });
};
