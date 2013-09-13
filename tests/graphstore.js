var expect = require('chai').expect,
    GraphStore = require('../src/lib/environment/graphstore');


var engines = [ 'orient', 'titan', 'tinker' ];

var config = {
    "graphconf": {
        "engine": "tinker",
        "titan": {
            'storage.backend': 'cassandra',
            'storage.keyspace': 'bntest',
            'storage.index.search.backend': 'lucene',
            'storage.index.search.directory': __dirname + '/data/titanft',
            'storage.index.search.client-only': false,
        },
        "orient": {
            'path': 'local:' + __dirname + '/data/orient',
            "username": "admin",
            "password": "admin"
        },
        "tinker": { }
    }
};

engines.forEach(function (engine) {
    var graphstore;
    var g;
    var rec1;
    var rec2;
    var edge1;
    describe(engine + ' -', function () {
        before(function () {
            config.graphconf.engine = engine;
            graphstore = new GraphStore(config);
            g = graphstore.g;
        });

        it('has the expected engine', function () {
            expect(graphstore.engine).to.equal(engine);
        });

        it('has database defined', function () {
            expect(graphstore.db).not.to.be.an('undefined');
        });

        it('adding vertex succeeds', function () {
            rec1 = graphstore.db.addVertexSync(null);
            rec1.setPropertySync('title', 'Great book');
            graphstore.db.commitSync();
            expect(rec1).not.to.be.an('undefined');
        });
    
        it('created expected vertex', function () {
            expect(g.v(rec1.getIdSync()).toJSON()[0].title).to.equal('Great book');
        });

        it('can find new vertex', function () {
            expect(g.V({'title': 'Great book'}).toJSON()[0].title).to.equal('Great book');
        });

        it('adding second vertex succeeds', function () {
            rec2 = graphstore.db.addVertexSync(null);
            rec2.setPropertySync('name', 'Dubious author');
            graphstore.db.commitSync();
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
            edge1 = graphstore.db.addEdgeSync(null, rec1, rec2, 'by');
            graphstore.db.commitSync();
            expect(edge1).not.to.be.an('undefined');
        });

        it('can find new edge', function () {
            expect(g.V({'name': 'Dubious author'}).inE().toArray().length).to.equal(1);
        });

        it('has exactly 1 edge', function () {
            expect(g.V().outE().toArray().length).to.equal(1);
        });

        it('removes edge successfully', function () {
            graphstore.db.removeEdgeSync(g.V({'name': 'Dubious author'}).inE().iterator().nextSync());
            graphstore.db.commitSync();
            expect(g.E().toArray().length).to.equal(0);
        });

        it('removes vertices successfully', function () {
            var vertices = g.V().iterator();
            var element;
            while (vertices.hasNextSync()){
                element = vertices.nextSync();
                element.removeSync();
            }
            graphstore.db.commitSync();
            expect(g.V().toArray().length).to.equal(0);
        });
        after(function () {
            g.V().remove();
        });
    });
});
