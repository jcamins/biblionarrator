"use strict";
var sharedview = require('../lib/sharedview'),
    models = require('../models'),
    RecordList = models.RecordList,
    Query = models.Query,
    paginator = require('../lib/paginator'),
    socketserver = require('../lib/socketserver'),
    Q = require('q'),
    searchengine = require('../lib/searchengine'),
    extend = require('extend');
var graphstore = require('../lib/graphstore'),
    g = graphstore();
var offload = require('../lib/graphoffloader'),
    cache = require('../lib/cache'),
    inspect = require('eyes').inspector({maxLength: false});

function prepareQuery(req) {
    var querystring = req.query.q || '';
    if (typeof req.query.facet === 'string') {
        querystring = querystring + ' ' + req.query.facet;
    } else if (typeof req.query.facet !== 'undefined') {
        querystring = querystring + ' ' + req.query.facet.join(' ');
    }
    return querystring;
}

exports.view = function(req, res) {
    var query = new Query(prepareQuery(req), 'qp');
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;
    
    Q.all([sharedview()]).then(function(data) {
        data.url = req.url.replace(/&?layout=[^&]*/, '');
        data.view = 'results';
        data.query = query;
        searchengine.search({ query: query, offset: offset, perpage: perpage }, function (list) {
            var layout = 'list/interface';
            if (typeof req.query.layout !== 'undefined' && req.query.layout === 'none') {
                data.layout = false;
                layout = 'partials/results';
            }
            extend(data, list);
            if (req.query.format === 'map') {
                req.query.records = [ ];
                data.records.forEach(function (rec) {
                    req.query.records.push(rec.id);
                });
                return exports.map(req, res);
            };
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
            searchengine.search({ query: query, offset: offset + perpage, perpage: perpage });
        }, function (data) {
            socketserver.announcePublication(encodeURIComponent('facets^' + query.canonical), data);
        });
    }, function (err) { res.send(404, err); });
};

exports.searchmap = function (req, res) {
    var query = req.query.q || '';
    var facets = [ ];
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;

    if (typeof req.query.facet === 'string') {
        query = query + ' ' + req.query.facet;
    } else if (typeof req.query.facet !== 'undefined') {
        query = query + ' ' + req.query.facet.join(' ');
    }
    var queryast = queryparser.qp.parse(query);

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

};

exports.map = function (req, res) {
    if (typeof req.query.landmark === 'string') {
        req.query.landmark = [ req.query.landmark ];
    }
    var options = {
        landmarks: req.query.landmark,
        records: req.query.records || req.query.landmark,
        depth: req.query.depth || 1,
        size: req.query.size || 60
    };
    var mapkey;
    if (typeof req.query.landmark !== 'undefined') {
        mapkey = encodeURIComponent('landmarkmap^' + req.query.landmark.join('^'));
    } else {
        mapkey = encodeURIComponent('recordmap^' + req.query.records.join('^'));
    }
    cache.get(mapkey, function (cacherecerror, cachemap) {
        if (cacherecerror || cachemap === null) {
            offload('map', options, function (results) {
                res.json(results.map);
                cache.set(mapkey, results.map, 600);
            });
        } else {
            res.json(cachemap);
        }
    });
};
