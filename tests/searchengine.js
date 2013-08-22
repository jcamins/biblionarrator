var opts = {
    engine: 'titan',
    titan: {
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
};

var expect = require('chai').expect,
    graphstore = require('../lib/graphstore'),
    g = graphstore(opts),
    models = require('../models'),
    Query = models.Query,
    searchengine = require('../lib/searchengine');
var inspect = require('eyes').inspector({maxLength: false});

describe('Search engine', function () {
    before(function () {
        require('../bin/gendata');
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

