exports.linkselect = function (req, res) {
    res.render('../views/link-select.mustache', { id: req.params.record_id }, function(err, html) {
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
