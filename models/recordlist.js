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
    console.log(query);
    if (typeof query === 'object' || query.length === 0) {
        query = query || { };
        query.model = 'record';
        results = g.V(query).as('me').out('recordtype').groupCount(facets, "{it.key}").back('me').has('model', 'record').dedup().toJSON();
    } else {
        results = graphstore.titanSearch(query).as('me').out('recordtype').groupCount(facets, "{it.key}").back('me').has('model', 'record').dedup().toJSON();
    }
    for (var ii in results) {
        results[ii] = models.Record.fromJSON(results[ii]);
    };
    return new RecordList(results, facets.toJSON());
};

RecordList.init = function(ref) {
    models = ref;
};
