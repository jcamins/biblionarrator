var offload = require('../graphoffloader');

module.exports.search = function (options, recordcb, facetcb) {
    offload('search', options, function (results) {
        recordcb(results.search);
        var direction = 'out';
        if (typeof options.linkbrowse !== 'undefined') {
            results.search.list = options.linkbrowse;
            direction = 'both';
        }
        offload('facet', { direction: direction, records: results.search.list, facettype: options.facettype, count: results.search.count }, facetcb);
    });
};
