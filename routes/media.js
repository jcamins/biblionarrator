var crypto = require('crypto'),
    fs = require('fs'),
    qfs = require('q-io/fs');

exports.upload = function (req, res) {
    var connection = require('../lib/datastore.js').connection;
    var shasum = crypto.createHash('sha1');
    shasum.update(req.params.record_id.toString(), 'utf8');
    var tmppath = req.files.image.path;
    var targetpath = '/uploads/' + shasum.digest('hex');
    fs.mkdir('public' + targetpath, function (err) {
        targetpath = targetpath + '/' + req.files.image.hash + req.files.image.path.substring(req.files.image.path.lastIndexOf('.'));
        qfs.exists(targetpath)
            .then(function (ex) {
                if (!ex) {
                    return qfs.move(tmppath, 'public' + targetpath);
                }
            })
            .then(function (err) {
                if (err) {
                    res.json({ 'error': err });
                } else {
                    req.body.description = req.body.description || '';
                    connection.query('INSERT INTO images (description, location, record_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [req.body.description, targetpath, req.params.record_id], function (err, results) {
                        if (err) {
                            res.json({ 'error': err });
                        } else {
                            res.json({ 'description': req.body.description, 'location': targetpath });
                        }
                    });
                }
                qfs.remove(tmppath);
            });
    });
};

exports.del = function (req, res) {
    var connection = require('../lib/datastore.js').connection;
    connection.query('DELETE FROM images WHERE record_id = ? AND id = ?', [req.params.record_id, req.params.id], function (err, results) {
        // We should probably also delete the image files, but we didn't in PHP either
    });
};
