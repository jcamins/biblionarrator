"use strict";
function GraphStore(config, engine) {
    var self = this;
    var g = require('gremlin');
    var heartbeatInterval;

    this.getDB = function () {
        return self.db;
    };
    this.getEngine = function () {
        return self.engine;
    };
    this.destroy = function () {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
        }
        try {
            self.db.shutdownSync();
            delete self.db;
        } catch (e) {
            console.log('Encountered error when destroying graphstore: ' + e);
        }
    };

    self.autocommit = true;
    self.g = g;

    self.engine = engine || config.engine || config.graphconf.engine;
    self.searchbackend = config.graphconf[self.engine]['storage.index.search.backend'];

    self.db = connect(config, self.engine, g);
    if (typeof self.db.isOpenSync === 'function') {
        heartbeatInterval = setInterval(function () {
            if (!self.db.isOpenSync()) {
                self.db = connect(config, self.engine, g);
            }
        }, 5000);
    }

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
        var LongEncoding = g.java.import('com.thinkaurelius.titan.util.encoding.LongEncoding');

        var gconf = new BaseConfiguration();
        for (var property in config.graphconf[engine]) {
            gconf.setPropertySync(property, config.graphconf[engine][property]);
        }
        db = TitanFactory.openSync(gconf);

        for (var name in config.indexes) {
            var index = config.indexes[name];
            var backends;
            var propertyclass = Type.Vertex.class;
            try {
                /*jshint -W086*/
                switch (index.type) {
                    case 'edge':
                        if (index.unidirected) {
                            index.id = db.makeTypeSync().nameSync(name).unidirectedSync().makeEdgeLabelSync().getIdSync();
                        } else {
                            index.id = db.makeTypeSync().nameSync(name).makeEdgeLabelSync().getIdSync();
                        }
                        break;
                    case 'edgeproperty':
                        propertyclass = Type.Edge.class;
                    case 'property':
                        if (index.system) {
                            backends = [ 'standard', 'search' ];
                        } else {
                            backends = [ 'standard' ];
                        }
                        var type = db.makeTypeSync().nameSync(name).dataTypeSync(Type[index.datatype].class);
                        backends.forEach(function (backend) {
                            type = type.indexedSync(backend, propertyclass);
                        });
                        if (index.unique && !index.multivalue) {
                            type = type.uniqueSync(Direction.BOTH, UniqCon.LOCK);
                        } else if (index.unique) {
                            type = type.uniqueSync(Direction.IN);
                        } else if (!index.multivalue) {
                            type = type.uniqueSync(Direction.OUT);
                        }
                        index.id = type.makePropertyKeySync().getIdSync();
                        break;
                    case 'text':
                        index.id = db.makeTypeSync().nameSync(name).dataTypeSync(Type.String.class)
                            .indexedSync("search", Type.Vertex.class)
                            .uniqueSync(Direction.OUT).makePropertyKeySync().getIdSync();
                        break;
                }
                /*jshint +W086*/
            } catch (e) {
                var type = db.getTypeSync(name);
                if (type !== null) {
                    index.id = type.getIdSync();
                }
            }
            if (typeof index.id !== 'undefined' && index.id !== null) {
                index.id = LongEncoding.encodeSync(index.id);
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
