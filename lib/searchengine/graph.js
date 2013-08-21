var offload = require('../graphoffloader');

module.exports.search = function (options, recordcb, facetcb) {
    offload('search', options, function (results) {
        recordcb(results.search);
        offload('facet', { mainfacet: 'recordtype', records: results.search.list, count: results.search.count }, facetcb);
    });
};
