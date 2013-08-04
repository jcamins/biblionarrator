var expect = require('chai').expect,
    fs = require('fs'),
    graphstore = require('../lib/graphstore');


var engines = [ 'tinker', 'titan', 'orient' ];

var opts = {
    titan: {
        'storage.keyspace': 'bntest',
    },

    orient: {
        path: 'local:' + __dirname + '/data/graph',
    }
};

try {
    fs.mkdirSync(__dirname + '/data');
    fs.mkdirSync(__dirname + '/data/graph');
} catch (e) {
};

engines.forEach(function (engine) {
    var g;
    var rec1;
    var rec2;
    describe(engine + ' -', function () {
        before(function () {
            opts.engine = engine;
            g = graphstore(opts);
        });

        it('has the expected engine', function () {
            expect(graphstore.getEngine()).to.equal(engine);
        });

        it('has database defined', function () {
            expect(graphstore.getDB()).not.to.be.an('undefined');
        });

        it('adding vertex succeeds', function () {
            rec1 = graphstore.getDB().addVertexSync(null);
            rec1.setPropertySync('title', 'Great book');
            expect(rec1).not.to.be.an('undefined');
            graphstore.getDB().commitSync();
        });
    
        it('created expected vertex', function () {
            expect(g.v(rec1).toJSON()[0].title).to.equal('Great book');
        });

        it('can find new vertex', function () {
            expect(g.V({'title': 'Great book'}).toJSON()[0].title).to.equal('Great book');
        });

        it('adding second vertex succeeds', function () {
            rec2 = graphstore.getDB().addVertexSync(null);
            rec2.setPropertySync('name', 'Dubious author');
            expect(rec2).not.to.be.an('undefined');
            graphstore.getDB().commitSync();
        });
    
        it('created second expected vertex', function () {
            expect(g.v(rec2).toJSON()[0].name).to.equal('Dubious author');
        });

        it('can find second new vertex', function () {
            expect(g.V({'name': 'Dubious author'}).toJSON()[0].name).to.equal('Dubious author');
        });

        it('has exactly 2 vertices', function () {
            expect(g.V().toArray().length).to.equal(2);
        });
    });
});

rmdirR(

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
