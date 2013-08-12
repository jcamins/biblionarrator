var models,
    offload = require('../lib/graphoffloader');

module.exports = RecordList;

function RecordList(data) {
    data.records = data.records || [];
    data.offset = data.offset || 0;
    data.records.forEach(function (one, index) {
        one.number = data.offset + index + 1;
        one.rendered = one.render();
    });
    var parts;
    var linktype;
    for (var prop in data) {
        if (data.hasOwnProperty(prop) && typeof data[prop] !== 'function') {
            this[prop] = data[prop];
        }
    }

    return this;
}

RecordList.search = function (query, facets, offset, perpage, recordcb, facetcb) {
    offload('search', { query: query, facets: facets, offset: offset, perpage: perpage }, function (results) {
        var records = results.search.records;
        var facetpub = offload('facet', { mainfacet: 'recordtype', records: results.search.list, count: results.search.count }, facetcb);
        for (var ii in records) {
            records[ii] = models.Record.fromJSON(records[ii]);
        }
        var reclist = new RecordList({ records: records,
            facetpub: facetpub.id,
            count: results.search.count,
            offset: offset,
            perpage: perpage
        });
        recordcb(reclist);
    });
};

RecordList.init = function(ref) {
    models = ref;
};
