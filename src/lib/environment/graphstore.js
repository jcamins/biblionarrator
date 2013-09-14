"use strict";
function GraphStore(config, engine) {
    var self = this;
    var g = require('gremlin');


    this.getDB = function () {
        return self.db;
    };
    this.getEngine = function () {
        return self.engine;
    };
    this.destroy = function () {
        try {
            self.db.shutdownSync();
            delete self.db;
        } catch (e) {
            console.log('Encountered error when destroying graphstore: ' + e);
        }
    };

    self.autocommit = true;
    self.g = g;
    /*function () {
        g.SetGraph(self.db);
        return g;
    };*/

    self.engine = engine || config.engine || config.graphconf.engine;

    self.db = connect(config, self.engine, g);
    process.on('exit', function () {
        self.destroy();
    });
    
    return self;
}

module.exports = GraphStore;

function connect(config, engine, g) {
    var db;
    if (engine === 'titan') {
        //Get a reference to Titan specific Enum
        var BaseConfiguration = g.java.import('org.apache.commons.configuration.BaseConfiguration');
        var TitanFactory = g.java.import('com.thinkaurelius.titan.core.TitanFactory');
        var Direction = g.Direction,
            Type = g.ClassTypes;
        var UniqCon = g.java.import("com.thinkaurelius.titan.core.TypeMaker$UniquenessConsistency");

        var gconf = new BaseConfiguration();
        for (var property in config.graphconf[engine]) {
            gconf.setPropertySync(property, config.graphconf[engine][property]);
        }
        db = TitanFactory.openSync(gconf);

        for (var name in config.indexes) {
            var index = config.indexes[name];
            try {
                switch (index.type) {
                    case 'edge':
                        if (index.unidirected) {
                            db.makeTypeSync().nameSync(name).unidirectedSync().makeEdgeLabelSync();
                        } else {
                            db.makeTypeSync().nameSync(name).makeEdgeLabelSync();
                        }
                        break;
                    case 'property':
                        if (index.unique && !index.multivalue) {
                            db.makeTypeSync().nameSync(name).dataTypeSync(Type[index.datatype].class)
                                .indexedSync(Type.Vertex.class)
                                .uniqueSync(Direction.BOTH, UniqCon.LOCK).makePropertyKeySync();
                        } else if (index.unique) {
                            db.makeTypeSync().nameSync(name).dataTypeSync(Type[index.datatype].class)
                                .indexedSync(Type.Vertex.class).uniqueSync(Direction.IN).makePropertyKeySync();
                        } else if (!index.multivalue) {
                            db.makeTypeSync().nameSync(name).dataTypeSync(Type[index.datatype].class)
                                .indexedSync(Type.Vertex.class).uniqueSync(Direction.OUT).makePropertyKeySync();
                        } else {
                            db.makeTypeSync().nameSync(name).dataTypeSync(Type[index.datatype].class)
                                .indexedSync(Type.Vertex.class).makePropertyKeySync();
                        }
                        break;
                    case 'text':
                        db.makeTypeSync().nameSync(name).dataTypeSync(Type.String.class)
                            .indexedSync("search", Type.Vertex.class)
                            .uniqueSync(Direction.OUT).makePropertyKeySync();
                        break;
                }
            } catch (e) {
            }
        }
    } else if (engine === 'orient') {
        var OrientGraph = g.java.import('com.tinkerpop.blueprints.impls.orient.OrientGraph');
        db = new OrientGraph(config.graphconf[engine].path, config.graphconf[engine].username, config.graphconf[engine].password);
    } else if (engine === 'tinker') {
        var TinkerGraph = g.java.import("com.tinkerpop.blueprints.impls.tg.TinkerGraph");
        if (typeof config.graphconf[engine].path === 'undefined' || config.graphconf[engine].path === null) {
            db = new TinkerGraph();
        } else {
            db = new TinkerGraph(config.graphconf[engine].path);
        }
        db.commitSync = function () {
        };
        db.commit = function (callback) {
            callback();
        };
    } else if (engine === 'neo4j') {
        var Neo4jGraph = g.java.import("com.tinkerpop.blueprints.impls.neo4j.Neo4jGraph");
        db = new Neo4jGraph(config.graphconf[engine].path);
    }
    g.SetGraph(db);
    return db;
}
