var models,
    graphstore = require('../lib/graphstore'),
    g = graphstore(),
    linktypes = require('../config/linktypes'),
    faceter = require('../lib/faceter');

module.exports = RecordList;

function RecordList(data) {
    data.records = data.records || [];
    data.facets = data.facets || {};
    data.records.forEach(function (one, index) {
        one.number = data.offset + index + 1;
        one.rendered = one.render();
    });
    var parts;
    var linktype;
    this.facets = { };
    this.mainfacet = { };
    for (var key in data.facets) {
        parts = key.split('@');
        linktype = linktypes[parts[0]];
        if (linktype) {
            if (data.mainfacet === '*') {
                this.mainfacet[linktype[parts[1] + 'label']] = this.mainfacet[linktype[parts[1] + 'label']] || 0;
                this.mainfacet[linktype[parts[1] + 'label']] = this.mainfacet[linktype[parts[1] + 'label']] + data.facets[key];
            }
            if (parts[1] === 'out') {
                this.facets[linktype['facetlabel']] = this.facets[linktype['facetlabel']] || { };
                this.facets[linktype['facetlabel']][parts[2]] = data.facets[key];
            }
        }
    }
    if (data.mainfacet !== '*' && linktypes[data.mainfacet]) {
        this.mainfacet = this.facets[linktypes[data.mainfacet]['facetlabel']];
    }
    this.records = data.records;
    this.count = data.count;

    return this;
}

RecordList.search = function (query, offset, perpage, recordcb, facetcb) {
    var results;
    //var facets = new g.HashMap();
    var count = new g.HashMap();
    var all = new g.ArrayList();
    if (typeof query === 'object' || query.length === 0) {
        query = query || null;
        results = g.V(query).as('me').groupCount(count, "{'_'}").back('me').aggregate(all).range(offset, offset + perpage - 1).toJSON();
    } else {
        results = graphstore.textSearch(query).as('me').groupCount(count, "{'_'}").back('me').aggregate(all).range(offset, offset + perpage - 1).toJSON();
    }
    faceter(all.toJSON(), function (facets) {
        console.log('we have facets');
        console.log(facets);
    });
    for (var ii in results) {
        results[ii] = models.Record.fromJSON(results[ii]);
    };
    return new RecordList({ records: results,
        facets: {},//facets,
        mainfacet: 'recordtype',
        count: count.toJSON()['_'],
        offset: offset,
        perpage: perpage
    });
};

RecordList.init = function(ref) {
    models = ref;
};
