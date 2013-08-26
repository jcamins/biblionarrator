"use strict";
var extend = require('extend'),
    graphstore = require('../graphstore'),
    config = graphstore.config,
    g = graphstore(),
    Text = g.java.import('com.thinkaurelius.titan.core.attribute.Text');
var inspect = require('eyes').inspector({maxLength: false});

var analysis = { };

var dbcallbacks = {
    'linkbrowse': function (object, pipeline) {
        analysis.linkbrowse = object[1];
        return g.v(object[1]).both().dedup();
    },
    'limit': function (object, pipeline) {
    },
    'offset': function (object, pipeline) {
    }
};

module.exports = function (input) {
    analysis = { };
    var records;
    var count = new g.HashMap();
    var list = new g.ArrayList();
    var summary = 'All records';

    records = searchTree(input.query.ast, g.V()).as('me').groupCount(count, "{'_'}").back('me').aggregate(list).range(input.offset, input.offset + input.perpage - 1).toJSON();
    count = count.toJSON()['_'];
    list = list.toJSON();
    if (analysis.linkbrowse) {
        summary = 'Links for ' + analysis.linkbrowse;
    } else if (input.query.canonical) {
        summary = 'Search: ' + input.query.canonical;
    }
    return extend({
        records: records,
        count: count,
        list: list,
        summary: summary
    }, analysis);
};

module.exports.message = 'search';

function searchTree(tree, pipeline) {
    if (typeof tree === 'undefined') {
        return pipeline;
    }
    switch (tree[0]) {
    case 'AND':
        return pipeline.and(searchTree(tree[1], g._()), searchTree(tree[2], g._()));
    case 'OR':
        return pipeline.or(searchTree(tree[1], g._()), searchTree(tree[2], g._()));
    case 'NOT':
        return pipeline.except(searchTree(tree[1], pipeline));
    case 'HAS':
    case 'FACET':
        var value = searchTree(tree[2], null);
        switch (config.indexes[tree[1]].type) {
        case 'property':
            return pipeline.has(tree[1], value).back(1);
        case 'edge':
            return pipeline.out(tree[1]).filter("{it.key=='" + value + "'}").back(2);
        case 'inverseedge':
            return pipeline.in(config.indexes[tree[1]].edge).filter("{it.key=='" + value + "'}").back(2);
        case 'text':
            if (graphstore.getEngine() === 'titan') {
                var verts = new g.ArrayList();
                g.start(graphstore.getDB().querySync().hasSync(tree[1], Text.CONTAINS, value).verticesSync()).aggregate(verts).iterate();
                return pipeline.retain(verts);
            } else {
                return pipeline.filter("{it.data?.count('" + value + "') >= 1}");
            }
        case 'dbcallback':
            return dbcallbacks[tree[1]](tree[2], pipeline);
        }
    case 'PHRASE':
        return tree[1];
    case 'ATOM':
        return tree.slice(1).join(' ');
    case 'FLOAT':
        pipeline = searchTree(tree[1], pipeline);
        return searchTree(tree[2], pipeline);
    }
    return pipeline;
}
