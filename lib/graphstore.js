var config = process.env['BN_GRAPHSTORE'] ? JSON.parse(process.env['BN_GRAPHSTORE']) : require('../config/graphstore'),
    g = require('gremlin');

var db;
var engine;

module.exports = function graph(opts) {
    opts = opts || JSON.parse(process.env['BN_GRAPHSTORE']);
    if (typeof opts !== 'undefined' || typeof db === 'undefined') {
        if (typeof opts !== 'undefined') {
            for (var opt in opts) {
                if (opts.hasOwnProperty(opt)) {
                    if (typeof opts[opt] === 'object') {
                        for (var engopt in opts[opt]) {
                            if (opts[opt].hasOwnProperty(engopt)) {
                                config[opt][engopt] = opts[opt][engopt];
                            }
                        }
                    } else {
                        config[opt] = opts[opt];
                    }
                }
            }
            engine = opts.engine || engine;
        }
        if (typeof db !== 'undefined') {
            db.shutdownSync();
            db = undefined;
        }
        process.env['BN_GRAPHSTORE'] = JSON.stringify(config);
        connect();
    }

    return g;
};

module.exports.getDB = function () {
    return db;
};

module.exports.getEngine = function () {
    return engine;
};

module.exports.textSearch = function (query) {
    if (engine === 'titan') {
        var Text = g.java.import('com.thinkaurelius.titan.core.attribute.Text');
        var temp =  g.start(db.querySync().hasSync('data', Text.CONTAINS, query).verticesSync());
        return temp;
    } else {
        return g.V().filter("{it.data?.count('" + query + "') >= 1}");
    }
};

module.exports.autocommit = true;

function connect() {
    engine = engine || config.default;

    if (engine === 'titan') {
        //Get a reference to Titan specific Enum
        var BaseConfiguration = g.java.import('org.apache.commons.configuration.BaseConfiguration');
        var TitanFactory = g.java.import('com.thinkaurelius.titan.core.TitanFactory');
        var Direction = g.Direction,
            Type = g.ClassTypes;
        var UniqCon = g.java.import("com.thinkaurelius.titan.core.TypeMaker$UniquenessConsistency");

        var gconf = new BaseConfiguration();
        for (var property in config[engine]) {
            gconf.setPropertySync(property, config[engine][property]);
        }
        db = TitanFactory.openSync(gconf);

        try {
            db.makeTypeSync().nameSync("key").dataTypeSync(Type.String.class).indexedSync(Type.Vertex.class)
                .uniqueSync(Direction.BOTH, UniqCon.LOCK).makePropertyKeySync();
            db.makeTypeSync().nameSync("model").dataTypeSync(Type.String.class).indexedSync(Type.Vertex.class)
                .uniqueSync(Direction.OUT).makePropertyKeySync();
            db.makeTypeSync().nameSync("deleted").dataTypeSync(Type.Integer.class).indexedSync(Type.Vertex.class)
                .indexedSync(Type.Edge.class).uniqueSync(Direction.OUT).makePropertyKeySync();
            db.makeTypeSync().nameSync("data").dataTypeSync(Type.String.class).indexedSync("search", Type.Vertex.class)
                .uniqueSync(Direction.OUT).makePropertyKeySync();
        } catch (e) {
            // These indexes probably already exist
        }

    } else if (engine === 'orient') {
        var OrientGraph = g.java.import('com.tinkerpop.blueprints.impls.orient.OrientGraph');
        db = new OrientGraph(config[engine].path, config[engine].username, config[engine].password);
    } else if (engine === 'tinker') {
        var TinkerGraph = g.java.import("com.tinkerpop.blueprints.impls.tg.TinkerGraph");
        if (config[engine].path === null) {
            db = new TinkerGraph();
        } else {
            db = new TinkerGraph(config[engine].path);
        }
        db.commitSync = function () {
        };
    } else if (engine === 'neo4j') {
        var Neo4jGraph = g.java.import("com.tinkerpop.blueprints.impls.neo4j.Neo4jGraph");
        db = new Neo4jGraph(config[engine].path);
    }
    process.on('exit', interruptHandler);
    process.on('SIGINT', function () {
        process.exit();
    });

    g.SetGraph(db);
}

function interruptHandler() {
    //db.commitSync();
    db.shutdownSync();
}

