var expect = require('chai').expect,
    fs = require('fs'),
    graphstore = require('../lib/graphstore');


var engines = [ 'orient', 'titan', 'tinker' ];

var opts = {
    titan: {
        'storage.keyspace': 'bntest',
        'storage.index.search.directory': __dirname + '/data/titanes',
    },

    orient: {
        path: 'local:' + __dirname + '/data/orient',
    },

    tinker: {
        path: __dirname + '/data/tinker',
    },

    neo4j: {
        path: __dirname + '/data/neo4j',
    },
};

engines.forEach(function (engine) {
    var g;
    var rec1;
    var rec2;
    var edge1;
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
            graphstore.getDB().commitSync();
            expect(rec1).not.to.be.an('undefined');
        });
    
        it('created expected vertex', function () {
            expect(g.v(rec1.getIdSync()).toJSON()[0].title).to.equal('Great book');
        });

        it('can find new vertex', function () {
            expect(g.V({'title': 'Great book'}).toJSON()[0].title).to.equal('Great book');
        });

        it('adding second vertex succeeds', function () {
            rec2 = graphstore.getDB().addVertexSync(null);
            rec2.setPropertySync('name', 'Dubious author');
            graphstore.getDB().commitSync();
            expect(rec2).not.to.be.an('undefined');
        });
    
        it('created second expected vertex', function () {
            expect(g.v(rec2.getIdSync()).toJSON()[0].name).to.equal('Dubious author');
        });

        it('can find second new vertex', function () {
            expect(g.V({'name': 'Dubious author'}).toJSON()[0].name).to.equal('Dubious author');
        });

        it('has exactly 2 vertices', function () {
            expect(g.V().toArray().length).to.equal(2);
        });

        it('adding edge succeeds', function () {
            edge1 = graphstore.getDB().addEdgeSync(null, rec1, rec2, 'by');
            graphstore.getDB().commitSync();
            expect(edge1).not.to.be.an('undefined');
        });

        it('can find new edge', function () {
            expect(g.V({'name': 'Dubious author'}).inE().toArray().length).to.equal(1);
        });

        it('has exactly 1 edge', function () {
            expect(g.V().outE().toArray().length).to.equal(1);
        });

        it('removes edge successfully', function () {
            graphstore.getDB().removeEdgeSync(g.V({'name': 'Dubious author'}).inE().iterator().nextSync());
            graphstore.getDB().commitSync();
            expect(g.E().toArray().length).to.equal(0);
        });

        it('removes vertices successfully', function () {
            var vertices = g.V().iterator();
            var element;
            while (vertices.hasNextSync()){
                element = vertices.nextSync();
                element.removeSync();
            };
            graphstore.getDB().commitSync();
            expect(g.V().toArray().length).to.equal(0);
        });
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
