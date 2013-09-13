var extend = require('extend'),
    QueryParser = require('queryparser'),
    GraphStore = require('./graphstore'),
    DataStore = require('./datastore'),
    Cache = require('./cache');

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
    if (typeof config !== 'undefined') {
        extend(self, config);
        self.fields = self.fields || { };
        self.indexes = self.indexes || { };
        self.facets = self.facets || { };
        self.schemas = self.schemas || [ ];
        self.schemas.unshift('common');
        self.schemas.forEach(function (which) {
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
                extend(self.facets, newschema.facets);
            } catch (e) {
                if (e.code === 'MODULE_NOT_FOUND') {
                    console.log('Schema ' + which + ' is not available');
                }
            }
        });
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
        Environment.set(message.setEnv);
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
