var models,
    graphstore = require('../lib/graphstore'),
    g = graphstore();

module.exports = RecordList;

function RecordList(records, mainfacet, facets) {
    records.forEach(function (one) {
        one.rendered = one.render();
    });
    this.records = records;
    this.mainfacet = mainfacet;
    this.facets = facets;

    return this;
}

RecordList.search = function (query) {
    var results;
    var facets = new g.HashMap();
    if (typeof query === 'object' || query.length === 0) {
        query = query || null;
        results = g.V(query).hasNot('model', 'user').as('me').out('recordtype').groupCount(facets, "{it.key}").optional('me').dedup().toJSON();
    } else {
        results = graphstore.textSearch(query).as('me').out('recordtype').groupCount(facets, "{it.key}").optional('me').dedup().toJSON();
    }
    for (var ii in results) {
        results[ii] = models.Record.fromJSON(results[ii]);
    };
    return new RecordList(results, facets.toJSON());
};

RecordList.init = function(ref) {
    models = ref;
};
