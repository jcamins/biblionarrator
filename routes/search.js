var sharedview = require('../lib/sharedview'),
    models = require('../models'),
    RecordList = models.RecordList,
    paginator = require('../lib/paginator'),
    Q = require('q');

exports.view = function(req, res) {
    var query = req.query.q || '';
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;

    Q.all([sharedview()]).then(function(defdata) {
        var data = defdata;
        data.view = 'results';
        if (query) {
            data.summary = 'Search: ' + query;
        } else {
            data.summary = 'All records';
        }
        data.query = query;
        RecordList.search(query, offset, perpage, function (list) {
            for (var idx in list) {
                data[idx] = list[idx];
            }

            if (data.count > data.records.length) {
                data.paginator = paginator(offset, data.count, perpage, req.path, req.query);
            }
            data.sortings = { available: [ { schema: 'mods', field: 'title', label: 'Title' } ] };
            res.render('list/interface', data, function(err, html) {
                if (err) {
                    res.send(404, err);
                } else {
                    res.send(html);
                }
            });
        });
    }, function (err) { console.log(err); });
};
