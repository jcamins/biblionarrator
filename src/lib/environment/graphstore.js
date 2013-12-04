"use strict";
var path = require('path'),
    util = require('util'),
    Gremlin = require('gremlin');

Gremlin.GraphWrapper.prototype._start = Gremlin.GraphWrapper.prototype.start;
Gremlin.GraphWrapper.prototype.start = function (ids) {
    var txn = this._getTransaction();
    var list = new this.ArrayList();
    if (!util.isArray(ids)) ids = [ ids ];
    if (typeof ids[0] === 'number' || typeof ids[0] === 'string') {
        for (var ii = 0; ii < ids.length; ii++) {
            list.addSync(txn.getVertexSync(ids[ii]));
        }
        return new this.gremlin.PipelineWrapper(this.gremlin, list.iteratorSync());
    } else {
        return this._start(arguments);
    }
};

Gremlin.ElementWrapper.prototype.incrementProperty = function (key, callback) {
    var self = this;
    this.getProperty(key, function (err, val) {
        if (err) return callback(err, null);
        self.setProperty(key, val + 1, callback);
    });
};

function GraphStore(config, engine) {
    var self = this;
    this.gremlin = new Gremlin({
        classpath: [ path.join(__dirname, '../../..', 'target', '**', '*.jar') ],
        options: [
            '-XX:+UseThreadPriorities',
            '-XX:ThreadPriorityPolicy=42',
            '-XX:+UseParNewGC',
            '-XX:+UseConcMarkSweepGC',
            '-XX:+CMSParallelRemarkEnabled',
            '-XX:SurvivorRatio=8',
            '-XX:MaxTenuringThreshold=1',
            '-XX:CMSInitiatingOccupancyFraction=75',
            '-XX:+UseCMSInitiatingOccupancyOnly',
            '-XX:+UseTLAB',
            '-XX:+UseCondCardMark',
            '-Dlog4j.configuration=file:' + path.resolve(__dirname, '../../../config/log4j.properties'),
            '-Dlogback.configurationFile=' + path.resolve(__dirname, '../../../config/logback.xml')
        ]
    });

    this.destroy = function () {
        self.g.shutdown(function (err, res) {
            delete self.g;
            if (err) environment.errorlog.write(err + '\n');
        });
    };

    self.autocommit = true;
    self.engine = engine || config.engine || config.graphconf.engine;
    self.searchbackend = config.graphconf[self.engine]['storage.index.search.backend'];
    self.g = self._g = this.connect(config, self.engine);
    //self.setTx(self.newTx());

    process.on('exit', function () {
        self.destroy();
    });
    
    return self;
}

module.exports = GraphStore;

GraphStore.prototype.connect = function connect(config, engine) {
    var db;
    var self = this;
    if (engine === 'titan') {
        //Get a reference to Titan specific Enum
        var BaseConfiguration = this.gremlin.java.import('org.apache.commons.configuration.BaseConfiguration');
        var TitanFactory = this.gremlin.java.import('com.thinkaurelius.titan.core.TitanFactory');
        var Type = this.gremlin.ClassTypes;
        var LongEncoding = this.gremlin.java.import('com.thinkaurelius.titan.util.encoding.LongEncoding');
        var Parameter = this.gremlin.java.import('com.thinkaurelius.titan.core.Parameter');
        var Mapping = this.gremlin.java.import('com.thinkaurelius.titan.core.Mapping');
        var TitanType = this.gremlin.java.getClassLoader().loadClassSync('com.thinkaurelius.titan.core.TitanType');

        var gconf = new BaseConfiguration();
        for (var property in config.graphconf[engine]) {
            gconf.setPropertySync(property, config.graphconf[engine][property]);
        }
        db = TitanFactory.openSync(gconf);

        var types = db.getTypesSync(TitanType).iteratorSync();

        while (types.hasNextSync()) {
            var type = types.nextSync();
            if (typeof config.indexes[type.getNameSync()] !== 'undefined') {
                config.indexes[type.getNameSync()].id = LongEncoding.encodeSync(type.getIdSync());
            } else {
                config.indexes[type.getNameSync()] = { id: LongEncoding.encodeSync(type.getIdSync()) };
            }
        }

        for (var name in config.indexes) {
            var index = config.indexes[name];
            if (index.id) continue;
            var backends;
            var propertyclass = Type.Vertex;
            /*jshint -W086*/
            switch (index.type) {
                case 'edge':
                    if (index.unidirected) {
                        index.id = db.makeLabelSync(name).unidirectedSync().makeSync().getIdSync();
                    } else {
                        index.id = db.makeLabelSync(name).makeSync().getIdSync();
                    }
                    break;
                case 'edgeproperty':
                    propertyclass = Type.Edge;
                case 'property':
                    if (index.system) {
                        backends = [ 'standard', 'search' ];
                    } else {
                        backends = [ 'standard' ];
                    }
                    var type = db.makeKeySync(name).dataTypeSync(Type[index.datatype]);
                    backends.forEach(function (backend) {
                        type = type.indexedSync(backend, propertyclass, self.gremlin.java.newArray('com.thinkaurelius.titan.core.Parameter', []));
                    });
                    if (index.unique && !index.multivalue) {
                        type = type.singleSync().uniqueSync();
                    } else if (index.unique) {
                        type = type.uniqueSync();
                    } else if (!index.multivalue) {
                        type = type.singleSync();
                    } else {
                        type = type.listSync();
                    }
                    index.id = type.makeSync().getIdSync();
                    break;
                case 'text':
                    index.id = db.makeKeySync(name).dataTypeSync(Type.String)
                        .indexedSync("search", Type.Vertex, this.gremlin.java.newArray('com.thinkaurelius.titan.core.Parameter', []))
                        .singleSync().makeSync().getIdSync();
                    break;
            }
            /*jshint +W086*/
            if (typeof index.id !== 'undefined' && index.id !== null) {
                index.id = LongEncoding.encodeSync(index.id);
            }
        }
        Gremlin.ElementWrapper.prototype.getId = function () {
            return this.el.getIdSync().longValue;
        };
    } else if (engine === 'orient') {
        var OrientGraph = this.gremlin.java.import('com.tinkerpop.blueprints.impls.orient.OrientGraph');
        db = new OrientGraph(config.graphconf[engine].path, config.graphconf[engine].username, config.graphconf[engine].password);
    } else if (engine === 'tinker') {
        var TinkerGraph = this.gremlin.java.import("com.tinkerpop.blueprints.impls.tg.TinkerGraph");
        if (typeof config.graphconf[engine].path === 'undefined' || config.graphconf[engine].path === null) {
            db = new TinkerGraph();
        } else {
            db = new TinkerGraph(config.graphconf[engine].path);
        }
    } else if (engine === 'neo4j') {
        var Neo4jGraph = this.gremlin.java.import("com.tinkerpop.blueprints.impls.neo4j.Neo4jGraph");
        db = new Neo4jGraph(config.graphconf[engine].path);
    }
    db.commitSync();
    return this.gremlin.wrap(db);
}
/*
GraphStore.prototype.newTx = function () {
    return this._g.newTransaction();
};

GraphStore.prototype.setTx = function (transaction) {
    this.g = transaction;
};*/
