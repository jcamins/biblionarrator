var opts = {
    engine: 'orient',
    titan: {
        'storage.keyspace': 'bntest',
    },

    orient: {
        path: 'local:' + __dirname + '/data/orient',
    },

    tinker: {
        path: 'local:' + __dirname + '/data/tinker',
    },

    neo4j: {
        path: 'local:' + __dirname + '/data/neo4j',
    },
};

var expect = require('chai').expect,
    graphstore = require('../lib/graphstore'),
    g = graphstore(opts),
    fs = require('fs'),
    models = require('../models'),
    Record = require('../models/record');

describe('Record model', function () {
    var rec;
    var rec2;
    var rec3;
    var _id;
    before(function () {
        rec = new Record({ 'data': JSON.stringify({ 'title': 'Great title', 'author': 'Good author' }), 'accno': 1001, 'type': 'book' });
        rec2 = new Record({ 'data': JSON.stringify({ 'title': 'Lousy title', 'author': 'Good author' }), 'accno': 1002, 'type': 'book' });
        rec3 = new Record({ 'data': JSON.stringify({ 'name': 'Good author' }), 'type': 'person' });
        rec2.save();
        rec3.save();
    });
    it('creation succeeds', function () {
        expect(rec.accno).to.equal(1001);
    });
    it('throws exception if transformed prior to save', function () {
        expect(rec.v).to.throw('record not saved');
    });
    it('saves successfully', function () {
        rec.save();
        expect(rec._id).to.be.defined;
        _id = rec._id;
    });
    it('can be transformed after save', function () {
        expect(rec.v()).to.be.defined;
    });
    it('can be retrieved from graphstore directly', function () {
        expect(g.v(rec._id).toArray().length).to.equal(1);
    });
    it('can be retrieved as a new model', function () {
        var newrec = Record.findOne({ _id: _id });
        expect(newrec.accno).to.equal(1001);
    });
    it('can be retrieved with a filter', function () {
        var books = Record.findAll({ type: 'book'});
        expect(books.length).to.equal(2);
    });
    /*var wantid;
    var rec;
    before(function (done) {
        datastore.query('SELECT id FROM records LIMIT 1', function (err, results, fields) {
            wantid = results[0].id;
            rec = new Record(wantid);
            rec.with(function (val) {
                rec = val;
                done();
            });
        });
    });
    it('has desired id', function () {
        expect(rec.id).to.equal(wantid);
    });
    it('has data', function () {
        expect(rec.data).to.not.equal(null);
    });*/
});

rmdirR(__dirname + '/data/orient');
rmdirR(__dirname + '/data/tinker');
rmdirR(__dirname + '/data/neo4j');

function rmdirR(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
