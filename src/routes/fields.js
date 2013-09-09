var models = require('../models'),
    Field = models.Field;

module.exports.save = function(req, res) {
    var field = req.body;
    field.schema = field.schema || req.params.schema;
    field.name = field.name || req.params.name;
    field = new Field(field);
    field.save();
    field.success = 1;
    res.json(field);
};

function makeHierarchy(fieldmap, goal) {
    var level = [ ];
    for (var idx in fieldmap) {
        if (fieldmap[idx].parent === goal) {
            var current = fieldmap[idx];
            delete fieldmap[idx];
            current.children = makeHierarchy(fieldmap, idx);
            level.push(current);
        }
    }
    return level;
}

module.exports.admin = function(req, res) {
    var data = { };
    Field.all(function (err, fieldmap) {
        data.field = fieldmap[req.params.schema + '_' + req.params.name];
        data.hierarchy = makeHierarchy(fieldmap);
        res.render('admin/field', data, function(err, html) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(html);
            }
        });
    });
};

module.exports.get = function(req, res) {
    Field.findOne(req.params.schema + '_' + req.params.name, function (err, field) {
        field = field || { };
        res.json(field);
    });
};

module.exports.editor = function(req, res) {
    Field.findOne(req.params.schema + '_' + req.params.name, function (err, field) {
        field = field || { };
        field.layout = false;
        res.render('partials/admin/field-editor', field, function(err, html) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(html);
            }
        });
    });
};
