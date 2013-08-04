var config = require('../config/graphstore'),
    g = require('gremlin');


var db;
var engine;

module.exports = function graph(opts) {
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
        }
        if (typeof db !== 'undefined') {
            db.shutdownSync();
            db = undefined;
        }
        engine = opts.engine || engine;
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

function connect() {
    engine = engine || config.default;

    if (engine === 'titan') {
        //Get a reference to Titan specific Enum
        var BaseConfiguration = g.java.import('org.apache.commons.configuration.BaseConfiguration');
        var TitanFactory = g.java.import('com.thinkaurelius.titan.core.TitanFactory');

        var gconf = new BaseConfiguration();
        for (var property in config[engine]) {
            gconf.setPropertySync(property, config[engine][property]);
        }
        db = TitanFactory.openSync(gconf);
    } else if (engine === 'orient') {
        var OrientGraph = g.java.import('com.tinkerpop.blueprints.impls.orient.OrientGraph');
        db = new OrientGraph(config[engine].path, config[engine].username, config[engine].password);
    } else if (engine === 'tinker') {
        var TinkerGraph = g.java.import("com.tinkerpop.blueprints.impls.tg.TinkerGraph");
        db = new TinkerGraph();
        db.commitSync = function () {
        };
    }
    process.on('exit', db.shutdownSync);
    process.on('SIGINT', db.shutdownSync);

    g.SetGraph(db);
}

