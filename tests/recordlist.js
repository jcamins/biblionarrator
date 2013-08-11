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
    fs = require('fs'),
    models = require('../models'),
    RecordList = require('../models/recordlist');
    Record = require('../models/record');

describe('RecordList model', function () {
    before(function () {
        require('../bin/gendata');
    });
    it('finds record using fielded search', function (done) {
        RecordList.search({ model: 'recordtype' }, 0, 20, function (list) {
            expect(list.records.length).to.equal(4);
            done();
        });
    });
    it('finds record using text search', function (done) {
        RecordList.search('silly', 0, 20, function (list) {
            expect(list.records.length).to.equal(1);
            done();
        });
    });
    after(function () {
        g.V().remove();
    });
});
