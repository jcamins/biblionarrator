var ElasticSearchClient = require('elasticsearchclient');

function ESClient(config) {
    var self = this;
    var client;

    if (config.graphconf.engine === 'titan' && config.graphconf.titan["storage.index.search.backend"] === "elasticsearch") {
        client = new ElasticSearchClient({
            host: config.graphconf.titan["storage.index.search.hostname"],
            port: 9200,
            secure: false
        });
    }

    self.search = function () {
        return client.search.apply(client, arguments);
    };

    self.index = { };
    self.fields = [ ];
    for (var index in config.indexes) {
        self.index[config.indexes[index].id] = index;
        if (config.indexes[index].system && (config.indexes[index].type === 'text' || config.indexes[index].type === 'property')) {
            self.fields.push(config.indexes[index].id);
        }
    }
    self.relevance_bumps = [ ];
    config.relevance_bumps.forEach(function(relevance_bump) {
        var bump = { };
        bump[relevance_bump.type] = { filter: { term: { } } };
        bump[relevance_bump.type].filter.term[config.indexes[relevance_bump.field].id] = relevance_bump.value;
        bump[relevance_bump.type].boost = relevance_bump.boost;
        self.relevance_bumps.push(bump);
    });

    return self;
}

module.exports = ESClient;
