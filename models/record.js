var models,
    graphstore = require('../lib/graphstore'),
    GraphModel = require('../lib/graphmodel'),
    g = graphstore(),
    formatters = require('../lib/formats'),
    models,
    offload = require('../lib/graphoffloader');

function Record(data) {
    this.snippet = function() {
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        return new Record({
            id: this.id,
            data: formatters[this.format].snippet(this.data),
        });
    };

    this.render = function() {
        if (typeof this.data === 'undefined' || this.data === null || this.data === '') {
            return '<article><header></header><section></section></article>';
        }
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        if (typeof formatters[this.format] === 'undefined') {
            return '';
        } else {
            return formatters[this.format].render(this.data);
        }
    };

    this.link = function (type, target) {
        if (typeof target === 'undefined' || target === null || target === '') {
            return;
        }
        var sv = g.v(this.id).iterator().nextSync();
        var tv = g.v(typeof target === 'string' ? target : target.id).iterator().nextSync();
        graphstore.getDB().addEdgeSync(null, sv, tv, type);
        if (graphstore.autocommit) {
            graphstore.getDB().commitSync();
        }
    };

    this.links = function (offset, perpage, recordcb, facetscb) {
        offload('linkbrowse', { id: this.id, offset: offset, perpage: perpage }, function (results) {
            var reclist = new models.RecordList({
                records: Record.fromJSON(results.linkbrowse.records),
                facet: results.linkbrowse.facet,
                count: results.linkbrowse.count
            });
            recordcb(reclist);
        });
    };

    this.initialize(data);

    return this;
}

Record.model = 'record';

module.exports = GraphModel(Record);


Record.init = function(ref) {
    models = ref;
};
