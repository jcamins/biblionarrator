var models = require('../../models'),
    graph = require('./graph'),
    cache = require('../cache'),
    queryparser = require('../queryparser');

module.exports.search = function (options, recordcb, facetcb) {
    var recordskey = encodeURIComponent('records^' + options.offset + '^' + options.perpage + '^' + queryparser.canonicalize(options.query));
    var facetskey = encodeURIComponent('facets^' + queryparser.canonicalize(options.query));
    cache.get(recordskey, function (cacherecerror, cacherecs) {
        if (cacherecerror || cacherecs === null) {
            graph.search(options, function (results) {
                var records = results.records;
                for (var ii in records) {
                    records[ii] = models.Record.fromJSON(records[ii]);
                }
                var reclist = new models.RecordList({ records: records,
                    facetpub: facetskey,
                    count: results.count,
                    offset: options.offset,
                    perpage: options.perpage
                });
                if (typeof recordcb === 'function') {
                    recordcb(reclist);
                }
                cache.set(recordskey, reclist, 600);
            }, function (results) {
                var facets = results.facet;
                if (typeof facetcb === 'function') {
                    facetcb(facets);
                }
                cache.set(facetskey, facets, 600);
            });
        } else {
            if (typeof recordcb === 'function') {
                recordcb(cacherecs);
            }
            cache.get(facetskey, function (cacheerror, cachefacets) {
                if (typeof facetcb === 'function') {
                    facetcb(cachefacets);
                }
            });
        }
    });
};
