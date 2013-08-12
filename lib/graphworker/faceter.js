var graphstore = require('../graphstore'),
    g = graphstore(),
    linktypes = require('../../config/linktypes');

module.exports = function (input) {
    var facets = new g.HashMap();
    for (var ii = 0; ii < input.records.length; ii++) {
        if (input.records[ii].substring(0, 2) === 'v[') {
            input.records[ii] = input.records[ii].substring(2, input.records[ii].length - 1);
        }
    }
    g.v(input.records).outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}").iterate();
    var rawfacets =  facets.toJSON();
    facets = { }
    var parts, linktype;
    for (var key in rawfacets) {
        parts = key.split('@');
        linktype = linktypes[parts[0]];
        if (linktype && (rawfacets[key] > 1 || rawfacets[key] >= input.records.length - 1)) {
            facets[linktype['facetlabel']] = facets[linktype['facetlabel']] || { };
            facets[linktype['facetlabel']][parts[2]] = rawfacets[key];
        }
    }
    var mainfacet = { };
    if (input.mainfacet) {
        mainfacet = facets[input.mainfacet] || { };
    }
    return { mainfacet: mainfacet, facets: facets, count: input.count || 0 };
};

module.exports.message = 'facet';

