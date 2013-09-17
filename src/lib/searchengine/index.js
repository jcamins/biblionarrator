var models = require('../../models'),
    graph = require('./graph'),
    cache = require('../environment').cache;

module.exports.search = function (options, recordcb, facetcb) {
    var recordskey = encodeURIComponent('records^' + options.offset + '^' + options.perpage + '^' + options.query.canonical);
    var facetskey = encodeURIComponent('facets^' + options.query.canonical);
    cache.mget([recordskey, facetskey], function (cacheerror, cacheresults) {
        if (cacheerror || cacheresults[0] === null) {
            graph.search(options, function (results) {
                var records = results.records;
                for (var ii in records) {
                    records[ii] = models.Record.fromJSON(records[ii]);
                }
                var reclist = new models.RecordList({ records: records,
                    facetpub: facetskey,
                    count: results.count,
                    offset: options.offset,
                    perpage: options.perpage,
                    summary: results.summary
                });
                if (typeof recordcb === 'function') {
                    recordcb(reclist);
                }
                cache.set(recordskey, reclist, 600);
            });
        } else if (typeof recordcb === 'function') {
            recordcb(cacheresults[0]);
        }
        if (cacheerror || cacheresults[1] === null) {
            graph.facet(options, function (results) {
                if (typeof facetcb === 'function') {
                    facetcb(results);
                }
                cache.set(facetskey, results, 600);
            });
        } else if (typeof facetcb === 'function') {
            facetcb(cacheresults[1]);
        }
    });
};
