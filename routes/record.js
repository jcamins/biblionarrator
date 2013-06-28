exports.linkselect = function (req, res) {
    res.render('../views/link-select.mustache', { id: req.params.id }, function(err, html) {
        res.send(html);
    });
};
