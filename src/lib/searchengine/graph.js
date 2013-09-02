var offload = require('bngraphworker');

module.exports.search = function (options, recordcb, facetcb) {
    offload('search', options, function (results) {
        recordcb(results.search);
        var faceter = 'standard';
        if (typeof results.linkbrowse !== 'undefined') {
            results.search.list = results.linkbrowse;
            faceter = 'relationship';
        }
        offload('facet', { records: results.search.list, faceter: faceter, count: results.search.count }, facetcb);
    });
};
