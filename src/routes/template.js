var models = require('../models'),
    Template = models.Template;

module.exports.get = function(req, res) {
    if (req.params.template) {
        Template.findOne(req.params.template, function (err, template) {
            res.json(template);
        });
    } else {
        Template.all(function (err, map) {
            res.json(map);
        });
    }
}

module.exports.save = function(req, res) {
    var template = req.body;
    template.id = req.params.template;
    template = new Template(template);
    template.save();
    template.success = 1;
    res.json(template);
};

module.exports.admin = function(req, res) {
    res.render('admin/template');
};
