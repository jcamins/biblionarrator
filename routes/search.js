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

    Q.all([sharedview()]).then(function(defdata) {
        var data = defdata;
        data.view = 'results';
        if (query) {
            data.summary = 'Search: ' + query;
        } else {
            data.summary = 'All records';
        }
        data.query = query;
        RecordList.search(query, facets, offset, perpage, function (list) {
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
        }, function (message) {
            message.url = req.url;
            socketserver.registerPublication(message);
        });
    }, function (err) { console.log(err); });
};

exports.ajax = function(req, res) {
    var query = req.query.q || '';
    var facets;
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;
    var data = { };

    RecordList.search(query, facets, offset, perpage, function (data) {
        data.url = req.url;
        data.layout = false;
        if (query) {
            data.summary = 'Search: ' + query;
        } else {
            data.summary = 'All records';
        }
        data.query = query;
        if (data.count > data.records.length) {
            data.paginator = paginator(offset, data.count, perpage, req.path, req.query);
        }
        data.sortings = { available: [ { schema: 'mods', field: 'title', label: 'Title' } ] };
        var accept = req.accepts([ 'html', 'json' ]);
        if (accept === 'html') {
            res.render('partials/results', data, function(err, html) {
                if (err) {
                    res.send(404, err);
                } else {
                    res.send(html);
                }
            });
        } else {
            res.json(data);
        }
    }, function (message) {
        socketserver.registerPublication(message);
    });
};
