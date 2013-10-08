"use strict";
var util = require('util'),
    sharedview = require('../lib/sharedview'),
    models = require('../models'),
    Query = models.Query,
    socketserver = require('../lib/socketserver'),
    Q = require('q'),
    searchengine = require('../lib/searchengine'),
    extend = require('extend');
var offload = require('bngraphworker'),
    environment = require('../lib/environment'),
    cache = environment.cache;

function prepareQuery(req) {
    var q = req.query.q;
    var querystring = '';
    if (util.isArray(q)) {
        var q = req.query.q;
        for (var ii = 0; ii < q.length; ii+=2) {
            if (q[ii] && q[ii+1]) {
                querystring += ' ' + q[ii] + q[ii+1];
            }
        }
    } else if (q) {
        querystring = q;
    }
    if (typeof req.query.facet === 'string') {
        querystring = querystring + ' ' + req.query.facet;
    } else if (typeof req.query.facet !== 'undefined') {
        querystring = querystring + ' ' + req.query.facet.join(' ');
    }
    return querystring;
}

exports.view = function(req, res) {
    try {
        var query = new Query(prepareQuery(req), 'qp', req.query.anchor);
    } catch (e) {
        environment.errorlog.write('Error parsing query: ' + e + '\n');
    }
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;
    var map = (req.query.format === 'map');
    var searchcb, facetcb;
    
    var accept = req.accepts([ 'html', 'json' ]);
    Q.all([sharedview()]).then(function(data) {
        data.url = req.url.replace(/&?layout=[^&]*/, '');
        data.view = 'results';
        data.query = query;
        if (!query || !Object.keys(query).length) {
            data.fields = environment.fields;
            return res.render('search', data);
        } else if (map) {
            searchcb = function (list) {
                req.query.records = [ ];
                list.records.forEach(function (rec) {
                    req.query.records.push(rec.id);
                });
                exports.map(req, res);
            };
        } else {
            searchcb = function (list) {
                var layout = 'list/interface';
                if (typeof req.query.layout !== 'undefined' && req.query.layout === 'none') {
                    data.layout = false;
                    layout = 'partials/results';
                }
                extend(data, list);
                if (data.count > data.offset + data.records.length) {
                    data.more = true;
                }
                if (accept === 'html') {
                    res.render(layout, data);
                } else {
                    res.json(list);
                }
                // Preseed next page
                if (data.more) {
                    searchengine.search({ query: query, offset: offset + perpage, perpage: perpage });
                }
            };
            facetcb = function (data) {
                socketserver.announcePublication(encodeURIComponent('facets^' + query.canonical), data);
            };
        }
        searchengine.search({ query: query, offset: offset, perpage: perpage }, searchcb, facetcb);
    }, function (err) { res.send(404, err); });
};

exports.map = function (req, res) {
    if (typeof req.query.landmark === 'string') {
        req.query.landmark = [ req.query.landmark ];
    }
    var options = {
        landmarks: req.query.landmark,
        records: req.query.records || req.query.landmark,
        depth: req.query.depth || 1,
        size: req.query.size || 30
    };
    var mapkey;
    if (typeof req.query.landmark !== 'undefined') {
        mapkey = encodeURIComponent('landmarkmap^' + req.query.landmark.join('^'));
    } else if (typeof req.query.records !== 'undefined') {
        mapkey = encodeURIComponent('recordmap^' + req.query.records.join('^'));
    }
    if (typeof mapkey === 'undefined') {
        return res.json({ });
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
