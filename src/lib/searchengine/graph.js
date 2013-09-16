var environment = require('../environment'),
    offload = require('bngraphworker');

module.exports.search = function (options, recordcb, facetcb) {
    if (typeof options.query !== 'undefined') {
        options.query.plan = environment.querybuilder.build(options.query.ast);
        options.query.offset = options.offset;
        options.query.size = options.perpage;
    }
    offload('search', options, function (results) {
        recordcb(results.search);
    });
    offload('facet', options, function (results) {
        facetcb(results.facet);
    });
};

module.exports.facet = function (options, facetcb) {
    if (typeof options.query !== 'undefined') {
        options.query.plan = environment.querybuilder.build(options.query.ast);
        options.query.offset = options.offset;
        options.query.size = options.perpage;
    }
    offload('facet', options, function (results) {
        facetcb(results.facet);
    });
};
