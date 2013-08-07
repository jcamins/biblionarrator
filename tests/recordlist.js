var opts = {
    engine: 'titan',
    titan: {
        'storage.keyspace': 'bntest',
        'storage.index.search.directory': __dirname + '/data/titanft',
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
    it('finds record using fielded search', function () {
        var reclist = RecordList.search({ model: 'recordtype' });
        expect(reclist.records.length).to.equal(3);
    });
    it('finds record using text search', function () {
        var reclist = RecordList.search('silly');
        expect(reclist.records.length).to.equal(1);
    });
});

rmdirR(__dirname + '/data/orient');
rmdirR(__dirname + '/data/tinker');
rmdirR(__dirname + '/data/neo4j');
rmdirR(__dirname + '/data/titanes');

function rmdirR(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                rmdirR(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

