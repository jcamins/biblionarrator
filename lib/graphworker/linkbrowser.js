var graphstore = require('../graphstore'),
    g = graphstore(),
    linktypes = require('../../config/linktypes');

module.exports = function (input) {
    var count = new g.HashMap();
    var facets = new g.HashMap();
    var list = new g.ArrayList();
    var records = g.v(input.id).as('me').copySplit(g._().outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}"), g._().inE().groupCount(facets, "{it.label + '@in@' + it.outV.key.next()}")).fairMerge().back('me').both().dedup().as('results').aggregate(list).groupCount(count, "{'_'}").back('results').range(input.offset, input.offset + input.perpage - 1).toJSON();
    var rawfacets =  facets.toJSON();
    facets = { '*': { } }
    var parts, linktype;
    for (var key in rawfacets) {
        parts = key.split('@');
        linktype = linktypes[parts[0]];
        if (linktype) {
            facets['*'][linktype[parts[1] + 'label']] = facets['*'][linktype[parts[1] + 'label']] || 0;
            facets['*'][linktype[parts[1] + 'label']] = facets['*'][linktype[parts[1] + 'label']] + rawfacets[key];
        }
    }
    var count = count.toJSON()['_'];
    return {
        records: records,
        facet: { mainfacet: facets['*'], facets: facets, count: count},
        count: count,
        list: list.toJSON()
    };
};

module.exports.message = 'linkbrowse';
