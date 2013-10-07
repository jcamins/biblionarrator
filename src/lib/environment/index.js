var fs = require('fs'),
    path = require('path'),
    extend = require('extend');

process.env['GREMLIN_JAVA_OPTIONS'] = '-Dlog4j.configuration=file:' + path.resolve(__dirname, '../../../config/log4j.properties') + ' -Dlogback.configurationFile=' + path.resolve(__dirname, '../../../config/logback.xml');

var QueryParser = require('queryparser'),
    GraphStore = require('./graphstore'),
    ESClient = require('./esclient'),
    QueryBuilder = require('./querybuilder'),
    Renderer = require('./renderer');

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

function resolveRoot(file) {
    return path.resolve(__dirname, '../../..', file);
}

function Environment(config) {
    var self = this;

    config = config || { };
    extend(true, self, {
        cacheconf: { backend: 'redis' },
        dataconf: { backend: 'redis' },
        sessionconf: { backend: 'redis' },
        fields: { },
        indexes: { },
        facets: { },
        static_relevance_bumps: { },
        schemas: [ ],
        logs: { },
        templates: { },
        errors: [ ],
        errorlog: process.stderr,
        accesslog: process.stdout
    });
    try {
        if (config.logs.error && config.logs.error !== '-') {
            self.errorlog = fs.createWriteStream(resolveRoot(config.logs.error), { flags: 'a' });
        }
    } catch (e) { }
    try {
        if (config.logs.access && config.logs.access !== '-') {
            self.accesslog = fs.createWriteStream(resolveRoot(config.logs.access), { flags: 'a' });
        }
    } catch (e) { }

    extend(self, config);
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
                newschema.fields[field].model = 'Field';
                self.fields[newschema.prefix + '_' + field] = newschema.fields[field];
                self.indexes[field] = newschema.fields[field];
                self.indexes[field].field = newschema.prefix  + '_' + field;
            });
            if (newschema.static_relevance_bumps) {
                extend(true, self.static_relevance_bumps, newschema.static_relevance_bumps);
            }
            if (newschema.templates) {
                newschema.templates.forEach(function (template) {
                    self.templates[template] = { id: template, data: fs.readFileSync(newschema.directory + '/templates/' + template + '.handlebars', { encoding: 'utf8' }), model: 'Template' };
                });
            }
            extend(self.facets, newschema.facets);
        } catch (e) { self.errors.push(e); }
    }
    var DataStore = require('./datastore/' + self.dataconf.backend),
        Cache = require('./cache/' + self.cacheconf.backend);
    var _queryparser, _graphstore, _datastore, _cache, _esclient, _querybuilder;
    Object.defineProperties(self, {
        "queryparser": {
            "get": function () { return _queryparser = _queryparser || new QueryParser(self); }
        },
        "graphstore": {
            "get": function () { return _graphstore = _graphstore || new GraphStore(self); }
        },
        "datastore": {
            "get": function () { return _datastore = _datastore || new DataStore(self); }
        },
        "cache": {
            "get": function () { return _cache = _cache || new Cache(self); }
        },
        "esclient": {
            "get": function () { return _esclient = _esclient || new ESClient(self); }
        },
        "querybuilder": {
            "get": function () { return _querybuilder = _querybuilder || new QueryBuilder(self); }
        }
    });
    try {
        self.renderer = new Renderer(self);
    } catch (e) { self.errors.push(e); }

    try {
        self.datastore.get('Template', '*', function (err, results) {
            for (var idx in results) {
                self.templates[idx] = results;
            }
            for (var template in self.templates) {
                self.renderer.register(template, self.templates[template].data);
            }
        });
    } catch (e) { self.errors.push(e); }

    self.load = Environment.load;
    self.set = Environment.set;
    self.merge = function(newconf) {
        extend(true, self, newconf);
    };

    if (self.errors.length > 0) {
        self.errorlog.write("Errors loading environment: \n" + self.errors.join("\n *") + "\n");
    }
    return self;
}

Environment.load = function loadConfig(file) {
    module.exports = new Environment(require(resolveRoot(file)));
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
        Environment.load('config/config');
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            Environment.set(defaultconfig);
        } else {
            console.log(e.stack);
            process.exit();
        }
    }
}
