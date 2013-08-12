var sharedview = require('../lib/sharedview'),
    models = require('../models'),
    RecordList = models.RecordList,
    paginator = require('../lib/paginator'),
    socketserver = require('../lib/socketserver'),
    Q = require('q');

exports.view = function(req, res) {
    var query = req.query.q || '';
    var facets = [ ];
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;

    req.query.facet = req.query.facet || [ ];
    if (typeof req.query.facet === 'string') {
        req.query.facet = [ req.query.facet ];
    }
    req.query.facet.forEach(function (el) {
        var split = el.split(/:(.*)?/);
        var obj = { };
        obj[split[0]] = split[1];
        facets.push(obj);
    });

    Q.all([sharedview()]).then(function(data) {
        data.url = req.url;
        data.view = 'results';
        if (query) {
            data.summary = 'Search: ' + query;
        } else {
            data.summary = 'All records';
        }
        data.query = query;
        RecordList.search(query, facets, offset, perpage, function (list) {
            var layout = 'list/interface';
            if (typeof req.query.layout !== 'undefined' && req.query.layout === 'false') {
                data.layout = false;
                layout = 'partials/results';
            }
            for (var idx in list) {
                data[idx] = list[idx];
            }

            if (data.count > data.records.length) {
                data.paginator = paginator(offset, data.count, perpage, req.path, req.query);
            }
            data.sortings = { available: [ { schema: 'mods', field: 'title', label: 'Title' } ] };
            res.render(layout, data, function(err, html) {
                if (err) {
                    res.send(404, err);
                } else {
                    res.send(html);
                }
            });
        }, function (data) {
            data.url = req.url;
            socketserver.registerPublication(data);
        });
    }, function (err) { console.log(err); });
};
