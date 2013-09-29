"use strict";
var ElasticSearchClient = require('elasticsearchclient');

function ESClient(config) {
    var self = this;
    var client;

    if (config.graphconf.engine === 'titan' && config.graphconf.titan["storage.index.search.backend"] === "elasticsearch") {
        self.inuse = true;
        client = new ElasticSearchClient({
            host: config.graphconf.titan["storage.index.search.hostname"],
            port: 9200,
            secure: false
        });
        self.indexname = config.graphconf.titan["storage.index.search.index-name"] || 'titan';
    }

    self.search = function () {
        return client.search.apply(client, arguments);
    };

    self.index = { };
    self.fields = [ ];
    for (var index in config.indexes) {
        self.index[config.indexes[index].id] = index;
        if (config.indexes[index].system && (config.indexes[index].type === 'text' || config.indexes[index].type === 'property') && index !== 'keyword') {
            self.fields.push(config.indexes[index].id);
        }
    }
    if (self.inuse) {
        var vorderquery = { query: { match_all: {} }, facets: { vorder: { statistical: { field: config.indexes['vorder'].id } } }, "size": 0 };
        self.search(self.indexname, 'vertex', vorderquery, function (err, data) {
            if (typeof err === 'undefined') {
                data = JSON.parse(data);
            }
            var maxvorder;
            var static_relevance = '';
            if (typeof data.facets !== 'undefined') {
                maxvorder = data.facets.vorder.max;
            }
            if (Object.keys(config.static_relevance_bumps).length > 0) {
                var bumpcount = 0;
                for (var field in config.static_relevance_bumps) {
                    static_relevance = static_relevance + "lu" + bumpcount + "=" + makeMVELMap(config.static_relevance_bumps[field]) + ";v" + bumpcount + "=doc['" + config.indexes[field].id + "'].value;";
                    bumpcount++;
                }
                static_relevance = static_relevance + "(((";
                for (var ii = 0; ii < bumpcount; ii++) {
                    if (ii > 0) {
                        static_relevance = static_relevance + '+';
                    }
                    static_relevance = static_relevance + 'lu' + ii + '[v' + ii + '] or 0';
                }
                static_relevance = static_relevance + ")/" + bumpcount + "f)+1)";
                if (maxvorder) {
                    static_relevance = static_relevance + "*((doc['" + config.indexes['vorder'].id + "'].value/" + maxvorder + "f)+1)";
                }
            } else if (maxvorder > 0) {
                static_relevance = "(doc['" + config.indexes['vorder'].id + "'].value/" + maxvorder + "f)+1";
            }
            if (static_relevance.length > 0) {
                self.rescore = { window_size: 500, query: { rescore_query: { custom_score: { query: { match_all: { } } } }, rescore_query_weight: 1.5 } };
                self.rescore.query.rescore_query.custom_score.script = static_relevance;
            }
        });
    }

    return self;
}

module.exports = ESClient;

function makeMVELMap(object) {
    var map = '';
    for (var key in object) {
        if (map.length > 0) {
            map = map + ',';
        }
        map = map + "'" + key + "':" + object[key];
    }
    return '[' + map + ']';
}
