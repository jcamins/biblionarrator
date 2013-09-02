var crypto = require('crypto'),
    fs = require('fs'),
    qfs = require('q-io/fs');

/*jshint unused:false */ /* Not yet updated */
exports.upload = function(req, res) {
    var datastore = require('../lib/datastore.js');
    var shasum = crypto.createHash('sha1');
    shasum.update(req.params.record_id.toString(), 'utf8');
    var tmppath = req.files.media.path;
    var targetpath = '/uploads/' + shasum.digest('hex');
    fs.mkdir('public' + targetpath, function(err) {
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
                    datastore.query('INSERT INTO images (description, location, record_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [req.body.description, targetpath, req.params.record_id], function(err) {
                        if (err) {
                            res.json({
                                'error': err
                            });
                        } else {
                            res.json({
                                'description': req.body.description,
                                'location': targetpath
                            });
                        }
                    });
                }
                qfs.remove(tmppath);
            });
        /* TODO: The client should inform the user of the status of the upload */
    });
};

exports.del = function(req, res) {
    var datastore = require('../lib/datastore.js');
    datastore.query('DELETE FROM images WHERE record_id = ? AND id = ?', [req.params.record_id, req.params.media_id], function(err, results) {
        // We should probably also delete the image files, but we didn't in PHP either
        res.json({
            id: req.params.media_id
        });
    });
};
/*jshint unused:true */
