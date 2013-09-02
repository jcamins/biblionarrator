var models = require('../models'),
    Field = models.Field;

module.exports.save = function(req, res) {
    var field = req.body;
    field.schema = field.schema || req.params.schema;
    field.field = field.field || req.params.field;
    field = new Field(field);
    field.save();
    res.json({ success: 1 });
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
    Field.all(function (err, fieldlist, fieldmap) {
        data.field = fieldmap[req.params.schema + '_' + req.params.field];
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

module.exports.editor = function(req, res) {
    Field.findOne(req.params.schema + '_' + req.params.field, function (err, field) {
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
