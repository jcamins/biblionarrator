var sharedview = require('../lib/sharedview'),
    models = require('../models'),
    RecordList = models.RecordList,
    paginator = require('../lib/paginator'),
    socketserver = require('../lib/socketserver'),
    Q = require('q'),
    searchengine = require('../lib/searchengine'),
    queryparser = require('../lib/queryparser');
var graphstore = require('../lib/graphstore'),
    g = graphstore();
    inspect = require('eyes').inspector({maxLength: false});

exports.view = function(req, res) {
    var query = req.query.q || '';
    var facets = [ ];
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;

    if (typeof req.query.facet === 'string') {
        query = query + ' ' + req.query.facet;
    } else if (typeof req.query.facet !== 'undefined') {
        query = query + ' ' + req.query.facet.join(' ');
    }
    var queryast = queryparser.parse(query);
    if (req.query.format === 'map') {
        var records = new g.ArrayList();
        var recordtypes = new g.ArrayList();
        var links;
        if (typeof query === 'object' || query.length === 0) {
            query = query || null;
            links = g.V(query).as('me').applyFacets(facets).store(records).bothE().as('links').outV().retain(records).back('links').inV().retain(records).back('links').toJSON();
        } else {
            links = graphstore.textSearch(query).as('me').applyFacets(facets).store(records).bothE().as('links').outV().retain(records).back('links').inV().retain(records).back('links').toJSON();
        }
        records = g.start(records).as('recs').out('recordtype').property('key').store(recordtypes).back('recs').toJSON();
        var recmap = { };
        recordtypes = recordtypes.toJSON();
        records.forEach(function (rec, index) {
            records[index].recordtype = recordtypes[index];
            recmap[rec._id] = index;
        });
        var removes = [ ];
        for (var ii = 0; ii < links.length; ii++) {
            links[ii].source = recmap[links[ii]._inV];
            links[ii].target = recmap[links[ii]._outV];
            if (typeof links[ii].source === 'undefined' || typeof links[ii].target === 'undefined') {
                removes.unshift(ii);
            }
        }
        removes.forEach(function (ii) {
            links.splice(ii, 1);
        });
        res.json({ records: records, links: links, recmap: recmap });
        return;
    }

    Q.all([sharedview()]).then(function(data) {
        data.url = req.url.replace(/&?layout=[^&]*/, '');
        data.view = 'results';
        if (query) {
            data.summary = 'Search: ' + query;
        } else {
            data.summary = 'All records';
        }
        data.query = query;
        searchengine.search({ query: queryast, offset: offset, perpage: perpage }, function (list) {
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
            // Preseed next page
            searchengine.search({ query: queryast, offset: offset + perpage, perpage: perpage });
        }, function (data) {
            if (data !== null) {
                data.url = req.url;
                for (var ii = 0; ii < data.facets.length; ii++) {
                    if (data.facets[ii].label === 'Record Type') {
                        data.mainfacet = data.facets[ii];
                    }
                }
                socketserver.announcePublication(encodeURIComponent('facets^' + queryparser.canonicalize(queryast)), data);
            }
        });
    }, function (err) { console.log(err); });
};

exports.map = function (req, res) {
    if (typeof req.query.landmark === 'string') {
        req.query.landmark = [ req.query.landmark ];
    }
    try {
        var records = new g.ArrayList();
        var recordtypes = new g.ArrayList();
        var links = g.v(req.query.landmark).as('landmarks').both().groupCount().cap().scatter().filter('{it.value > 1}').transform('{it.key}').as('conn').copySplit(g._(), g._().back('landmarks')).fairMerge().dedup().store(records).bothE().as('links').outV().retain(records).back('links').inV().retain(records).back('links').toJSON();
        records = g.start(records).as('recs').out('recordtype').property('key').store(recordtypes).back('recs').toJSON();
        var recmap = { };
        recordtypes = recordtypes.toJSON();
        records.forEach(function (rec, index) {
            records[index].recordtype = recordtypes[index];
            recmap[rec._id] = index;
        });
        var removes = [ ];
        for (var ii = 0; ii < links.length; ii++) {
            links[ii].source = recmap[links[ii]._inV];
            links[ii].target = recmap[links[ii]._outV];
            if (typeof links[ii].source === 'undefined' || typeof links[ii].target === 'undefined') {
                removes.unshift(ii);
            }
        }
        removes.forEach(function (ii) {
            links.splice(ii, 1);
        });
        res.json({ records: records, links: links, landmarks: req.query.landmark, recmap: recmap });
    } catch (e) {
        res.json({ records: [ ], links: [ ] });
    }
};
