var models,
    graphstore = require('../lib/graphstore'),
    g = graphstore(),
    linktypes = require('../config/linktypes');

module.exports = RecordList;

function RecordList(records, facets, mainfacet) {
    records.forEach(function (one, index) {
        one.number = index + 1;
        one.rendered = one.render();
    });
    var parts;
    var linktype;
    this.facets = { };
    this.mainfacet = { };
    for (var key in facets) {
        parts = key.split('@');
        linktype = linktypes[parts[0]];
        if (linktype) {
            if (mainfacet === '*') {
                this.mainfacet[linktype[parts[1] + 'label']] = this.mainfacet[linktype[parts[1] + 'label']] || 0;
                this.mainfacet[linktype[parts[1] + 'label']] = this.mainfacet[linktype[parts[1] + 'label']] + facets[key];
            }
            if (parts[1] === 'out') {
                this.facets[linktype['facetlabel']] = this.facets[linktypes[parts[0]]] || { };
                this.facets[linktype['facetlabel']][parts[2]] = facets[key];
            }
        }
    }
    if (mainfacet !== '*' && linktypes[mainfacet]) {
        this.mainfacet = this.facets[linktypes[mainfacet]['facetlabel']];
    }
    console.log(this.facets);
    console.log(this.mainfacet);
    this.records = records;
    this.count = records.length;

    return this;
}

RecordList.search = function (query) {
    var results;
    var facets = new g.HashMap();
    if (typeof query === 'object' || query.length === 0) {
        query = query || null;
        results = g.V(query).hasNot('model', 'user').as('me').outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}").optional('me').dedup().toJSON();
    } else {
        results = graphstore.textSearch(query).as('me').outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}").optional('me').dedup().toJSON();
    }
    for (var ii in results) {
        results[ii] = models.Record.fromJSON(results[ii]);
    };
    return new RecordList(results, facets.toJSON(), 'recordtype');
};

RecordList.init = function(ref) {
    models = ref;
};
