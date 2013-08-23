"use strict";
var config = require('../../config/searchengine'),
    graphstore = require('../graphstore'),
    g = graphstore(),
    Text = g.java.import('com.thinkaurelius.titan.core.attribute.Text');
var inspect = require('eyes').inspector({maxLength: false});

var dbcallbacks = {
    'linkbrowse': function (object, pipeline) {
        return g.v(object[1]).both();
        //.copySplit(g._().outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}"), g._().inE().groupCount(facets, "{it.label + '@in@' + it.outV.key.next()}")).fairMerge().back('me').both().dedup()
    }
};

module.exports = function (input) {
    var records;
    var count = new g.HashMap();
    var list = new g.ArrayList();

    records = searchTree(input.query.ast, g.V()).as('me').groupCount(count, "{'_'}").back('me').aggregate(list).range(input.offset, input.offset + input.perpage - 1).toJSON();
    count = count.toJSON()['_'];
    list = list.toJSON();
    return {
        records: records,
        count: count,
        list: list
    };
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
        case 'text':
            if (graphstore.getEngine() === 'titan') {
                var verts = new g.ArrayList();
                g.start(graphstore.getDB().querySync().hasSync('data', Text.CONTAINS, value).verticesSync()).aggregate(verts).iterate();
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
