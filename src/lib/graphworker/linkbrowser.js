var graphstore = require('../graphstore'),
    g = graphstore(),
    linktypes = require('../../../config/linktypes');

module.exports = function (input) {
    var count = new g.HashMap();
    var facets = new g.HashMap();
    var list = new g.ArrayList();
    var records = g.v(input.id).as('me').applyFacets(input.facets).copySplit(g._().outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}"), g._().inE().groupCount(facets, "{it.label + '@in@' + it.outV.key.next()}")).fairMerge().back('me').both().dedup().as('results').aggregate(list).groupCount(count, "{'_'}").back('results').range(input.offset, input.offset + input.perpage - 1).toJSON();
    var rawfacets =  facets.toJSON();
    facets = { '*': { label: 'Relationships', options: [ ]} };
    var tmpfacets = { };
    var parts, linktype;
    for (var key in rawfacets) {
        parts = key.split('@');
        linktype = linktypes[parts[0]];
        if (linktype) {
            tmpfacets[linktype[parts[1] + 'label']] =  tmpfacets[linktype[parts[1] + 'label']] || { label: linktype[parts[1] + 'label'], link: encodeURIComponent(parts[0]), count: rawfacets[key], type: parts[1] };
            tmpfacets[linktype[parts[1] + 'label']].count = tmpfacets[linktype[parts[1] + 'label']].count + rawfacets[key];
        }
    }
    for (var tmp in tmpfacets) {
        facets['*'].options.push(tmpfacets[tmp]);
    }
    for (var facet in facets) {
        facets[facet].options = facets[facet].options.sort(function (a, b) {
            return b.count - a.count;
        });
    }
    count = count.toJSON()['_'];
    return {
        records: records,
        facet: { mainfacet: facets['*'], facets: facets, count: count},
        count: count,
        list: list.toJSON()
    };
};

module.exports.message = 'linkbrowse';
