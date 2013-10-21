var crypto = require('crypto'),
    path = require('path'),
    fs = require('fs'),
    qfs = require('q-io/fs'),
    models = require('../models'),
    Record = models.Record;

/*jshint unused:false */ /* Not yet updated */
exports.upload = function(req, res) {
    var shasum = crypto.createHash('sha1');
    shasum.update(req.params.record_id.toString(), 'utf8');
    var tmppath = req.files.media.path;
    var targetpath = '/uploads/' + shasum.digest('hex');
    fs.mkdir(path.resolve(__dirname, '../../', 'public' + targetpath), function(err) {
        targetpath = targetpath + '/' + req.files.media.hash + req.files.media.path.substring(req.files.media.path.lastIndexOf('.'));
        qfs.exists(targetpath)
            .then(function(ex) {
                if (!ex) {
                    return qfs.move(tmppath, 'public' + targetpath);
                }
            })
            .then(function(err) {
                if (err) {
                    res.json({
                        'error': err
                    });
                } else {
                    req.body.description = req.body.description || '';
                    var rec = Record.findOne({ id: req.params.record_id });
                    console.log(rec);
                    rec.addMedia(req.files.media.hash, req.body.description, targetpath);
                    rec.save();
                    res.json({
                        'description': req.body.description,
                        'location': targetpath
                    });
                }
                qfs.remove(tmppath);
            });
        /* TODO: The client should inform the user of the status of the upload */
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
/*jshint unused:true */
