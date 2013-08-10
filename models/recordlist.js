var models,
    graphstore = require('../lib/graphstore'),
    g = graphstore(),
    offload = require('../lib/graphoffloader');

module.exports = RecordList;

function RecordList(data) {
    data.records = data.records || [];
    data.facets = data.facets || {};
    data.offset = data.offset || 0;
    data.records.forEach(function (one, index) {
        one.number = data.offset + index + 1;
        one.rendered = one.render();
    });
    var parts;
    var linktype;
    this.facets = data.facets || { };
    if (data.facets) {
        this.mainfacet = data.facets[data.mainfacet] || { };
    } else {
        this.mainfacet = { };
    }
    this.records = data.records;
    this.count = data.count;

    return this;
}

RecordList.search = function (query, offset, perpage, recordcb, facetcb) {
    offload('search', { query: query, offset: offset, perpage: perpage }, function (results) {
        var records = results.search.records;
        offload('facet', results.search.list, function (facets) {
            for (var ii in records) {
                records[ii] = models.Record.fromJSON(records[ii]);
            }
            var reclist = new RecordList({ records: records,
                facets: facets.facet,
                mainfacet: 'Record type',
                count: results.search.count,
                offset: offset,
                perpage: perpage
            });
            recordcb(reclist);
        });
    });
};

RecordList.init = function(ref) {
    models = ref;
};
