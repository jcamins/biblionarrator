var fs = require('fs'),
    path = require('path'),
    extend = require('extend');

process.env['GREMLIN_JAVA_OPTIONS'] = '-Dlog4j.configuration=file:' + path.resolve(__dirname, '../../../config/log4j.properties') + ' -Dlogback.configurationFile=' + path.resolve(__dirname, '../../../config/logback.xml');

var QueryParser = require('queryparser'),
    GraphStore = require('./graphstore'),
    DataStore = require('./datastore'),
    Cache = require('./cache'),
    ESClient = require('./esclient'),
    QueryBuilder = require('./querybuilder');

var defaultconfig = {
    "operators": {
        "AND": "&&",
        "OR": "\\|\\|",
        "FLOAT_START": "\\{\\{",
        "FLOAT_END": "\\}\\}",
        "GS": "\\(",
        "GE": "\\)",
        "REQ": "\\+",
        "DIS": "-",
        "MOD": "#",
        "NOT": "!",
        "FACET_START": "\\[",
        "FACET_END": "\\]",
        "FILTER_START": "(range)<",
        "FILTER_END": ">"
    },
    "schemas": [
        "ericthesaurus",
        "eric"
    ],
    "graphconf": {
        "engine": "tinker",
        "titan": {
            "storage.backend": "cassandra",
            "storage.hostname": "127.0.0.1",
            "storage.keyspace": "biblionarrator",
            "storage.index.search.backend": "elasticsearch",
            "storage.index.search.client-only": true,
            "storage.index.search.hostname": "127.0.0.1",
            "storage.index.search.index-name": "biblionarrator"
        },
        "orient": {
            "path": "local:/var/lib/orient/biblionarrator",
            "username": "admin",
            "password": "admin"
        },
        "tinker": { }
    }
};

function Environment(config) {
    var self = this;
    if (typeof config === 'undefined' || typeof config.logs === 'undefined' || typeof config.logs.error === 'undefined' || config.logs.error === '-') {
        self.errorlog = process.stderr;
    } else {
        self.errorlog = fs.createWriteStream(path.resolve(__dirname, '../../..', config.logs.error), { flags: 'a' });
    }
    if (typeof config === 'undefined' || typeof config.logs === 'undefined' || typeof config.logs.access === 'undefined' || config.logs.access === '-') {
        self.accesslog = process.stdout;
    } else {
        self.accesslog = fs.createWriteStream(path.resolve(__dirname, '../../..', config.logs.access), { flags: 'a' });
    }

    if (typeof config !== 'undefined') {
        extend(self, config);
        self.fields = self.fields || { };
        self.indexes = self.indexes || { };
        self.facets = self.facets || { };
        self.static_relevance_bumps = self.static_relevance_bumps || { };
        self.schemas = self.schemas || [ ];
        if (typeof self.fields.data === 'undefined') {
            self.schemas.unshift('common');
        }
        var which;
        while ((which = self.schemas.shift())) {
            var newschema = { };
            try {
                newschema = require('bn-schema-' + which);
                Object.keys(newschema.fields).forEach(function (field) {
                    newschema.fields[field].name = field;
                    newschema.fields[field].schema = newschema.prefix;
                    newschema.fields[field].config = true;
                    newschema.fields[field].model = 'Field';
                    self.fields[newschema.prefix + '_' + field] = newschema.fields[field];
                    self.indexes[field] = newschema.fields[field];
                    self.indexes[field].field = newschema.prefix  + '_' + field;
                });
                if (newschema.static_relevance_bumps) {
                    extend(true, self.static_relevance_bumps, newschema.static_relevance_bumps);
                }
                extend(self.facets, newschema.facets);
            } catch (e) {
                if (e.code === 'MODULE_NOT_FOUND') {
                    console.log('Schema ' + which + ' is not available');
                }
            }
        }
        try {
            self.queryparser = new QueryParser(self);
        } catch (e) {
            self.errors = self.errors || [ ];
            self.errors.push(e);
        }
        try {
            self.graphstore = new GraphStore(self);
        } catch (e) {
            self.errors = self.errors || [ ];
            self.errors.push(e);
        }
        try {
            self.datastore = new DataStore(self);
        } catch (e) {
            self.errors = self.errors || [ ];
            self.errors.push(e);
        }
        try {
            self.cache = new Cache(self);
        } catch (e) {
            self.errors = self.errors || [ ];
            self.errors.push(e);
        }
        try {
            self.esclient = new ESClient(self);
        } catch (e) {
            self.errors = self.errors || [ ];
            self.errors.push(e);
        }
        try {
            self.querybuilder = new QueryBuilder(self);
        } catch (e) {
            self.errors = self.errors || [ ];
            self.errors.push(e);
        }
        if (self.errors) {
            console.log("Errors loading environment: \n" + self.errors.join(' *'));
        }
    }
    self.load = Environment.load;
    self.set = Environment.set;
    self.merge = function(newconf) {
        extend(true, self, newconf);
    };
    return self;
}

Environment.load = function loadConfig(file) {
    module.exports = new Environment(require(file));
    return module.exports;
};

Environment.set = function setConfig(config) {
    module.exports = new Environment(config);
    return module.exports;
};

process.on('message', function (message) {
    if (typeof message.setEnv !== 'undefined') {
        Environment.set(JSON.parse(message.setEnv));
    }
});

if (typeof process.env['BN_CONFIG'] !== 'undefined') {
    Environment.set(JSON.parse(process.env['BN_CONFIG']));
} else {
    try {
        Environment.load('../../../config/config');
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            Environment.set(defaultconfig);
        }
    }
}
