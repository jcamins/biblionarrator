var graphstore = require('../graphstore'),
    g = graphstore(),
    linktypes = require('../../config/linktypes');

module.exports = function (all) {
    var facets = new g.HashMap();
    for (var ii = 0; ii < all.length; ii++) {
        if (all[ii].substring(0, 2) === 'v[') {
            all[ii] = all[ii].substring(2, all[ii].length - 1);
        }
    }
    g.v(all).outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}").iterate();
    var rawfacets =  facets.toJSON();
    facets = { }
    var parts, linktype;
    for (var key in rawfacets) {
        parts = key.split('@');
        linktype = linktypes[parts[0]];
        if (linktype && (rawfacets[key] > 1 || rawfacets[key] >= all.length - 1)) {
            facets[linktype['facetlabel']] = facets[linktype['facetlabel']] || { };
            facets[linktype['facetlabel']][parts[2]] = rawfacets[key];
        }
    }
    return facets;
};

module.exports.message = 'facet';

