var opts = {
    engine: 'titan',
    titan: {
        'storage.backend': 'cassandra',
        'storage.hostname': '127.0.0.1',
        'storage.keyspace': 'bntest',
        'storage.index.search.backend': 'lucene',
        'storage.index.search.directory': __dirname + '/data/titanft',
        'storage.index.search.client-only': false,
    },

    orient: {
        path: 'local:' + __dirname + '/data/orient',
    },

    tinker: {
        path: null,
    },

    neo4j: {
        path: __dirname + '/data/neo4j',
    },
    schema:  {
        operators: {
           'AND': '&&',
           'OR': '\\|\\|',
           'FLOAT_START': '\\{\\{',
           'FLOAT_END': '\\}\\}',
           'GS': '\\(',
           'GE': '\\)',
           'REQ': '\\+',
           'DIS': '-',
           'MOD': '#',
           'NOT': '!',
           'FACET_START': '\\[',
           'FACET_END': '\\]',
           'FILTER_START': '(range)<',
           'FILTER_END': '>'
        },
        indexes: {
            author: {
                type: 'edge',
                unidirected: false
            },
            title: {
                type: 'text'
            },
            keyword: {
                type: 'text',
                unique: false,
                multivalue: false
            },
            key: {
                type: 'property',
                datatype: 'String',
                unique: true,
                multivalue: false
            },
            recordtype: {
                type: 'edge',
                unidirected: true
            },
            model: {
                type: 'property',
                datatype: 'String',
                unique: false,
                multivalue: false
            },
            linkbrowse: {
                type: 'dbcallback'
            },
            vorder: {
                type: 'property',
                datatype: 'Integer',
                unique: false,
                multivalue: false
            }
        },
        facets: {
            "author": {
                "outlabel": "By",
                "inlabel": "Wrote",
                "facetlabel": "Author"
            },
            "subject": {
                "outlabel": "About",
                "inlabel": "Topic of",
                "facetlabel": "Subject"
            },
            "recordtype": {
                "outlabel": "Is a",
                "inlabel": "Example of",
                "facetlabel": "Record type"
            }
        }
    }
};

var expect = require('chai').expect,
    graphstore = require('../src/node_modules/bngraphstore'),
    g = graphstore(opts),
    models = require('../src/models'),
    Query = models.Query,
    searchengine = require('../src/lib/searchengine');

describe('Search engine', function () {
    before(function () {
        require('../tools/graphstore/gendata');
    });
    it('finds record using fielded search', function (done) {
        searchengine.search({ query: new Query('model:recordtype', 'qp'), offset: 0, perpage: 20 }, function (list) {
            expect(list.records.length).to.equal(4);
            done();
        });
    });
    it('finds record using text search', function (done) {
        searchengine.search({ query: new Query('France', 'qp'), offset: 0, perpage: 20 }, function (list) {
            expect(list.records.length).to.equal(2);
            done();
        });
    });
    it('handles facets in a text search', function (done) {
        searchengine.search({ query: new Query('France recordtype[place]', 'qp'), offset: 0, perpage: 20 }, function (list) {
            expect(list.records.length).to.equal(1);
            done();
        });
    });
    after(function () {
        g.V().remove();
    });
});

