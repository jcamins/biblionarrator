var expect = require('chai').expect,
    config = require('./lib/config'),
    environment = require('./lib/environment').default;
var graphstore = environment.graphstore,
    g = graphstore.g,
    models = require('../src/models'),
    Query = models.Query,
    searchengine = require('../src/lib/searchengine');

describe('Search engine', function () {
    before(function (done) {
        require('../tools/graphstore/gendata');
        graphstore.db.commitSync();
        done();
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
        graphstore.db.commitSync();
    });
});

