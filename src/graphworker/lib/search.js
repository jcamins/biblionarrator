"use strict";
var environment = require('../../lib/environment'),
    graphstore = environment.graphstore,
    g = graphstore.g,
    Text = g.java.import('com.thinkaurelius.titan.core.attribute.Text'),
    LongEncoding = g.java.import('com.thinkaurelius.titan.util.encoding.LongEncoding');

var analysis = { };
var optimizer = { };

var dbcallbacks = {
    'linkbrowse': function (object) {
        analysis.linkbrowse = object[1];
        return g.v(object[1]).both().dedup();
    }
};

var operations = {
    'edge': function (pipeline, label, value) {
        return pipeline.outE(label).filter("{it.marker == '" + value.replace("'", "\\'") + "'}").inV().in();
    },
    'inverseedge': function (pipeline, label, value) {
        return pipeline.inE(label).filter("{it.marker == '" + value.replace("'", "\\'") + "'}").outV().out();
    },
    'biedge': function (pipeline, label, value) {
        return pipeline.both(label).has('key', value).back(2);
    }
};

module.exports = function Search (query, callback) {
    if (query.plan.unoptimizable) {
        var pipeline;
        analysis = { };
        optimizer = {
            gremlinops: [ ]
        };
        if (query.anchor) {
            pipeline = g.v(query.anchor);
        } else {
            if (graphstore.engine === 'titan') {
                optimizer.vertexquery = graphstore.db.querySync();
            }
            pipeline = g.V();
        }
        pipeline = searchTree(query.ast, pipeline);
        if (typeof optimizer.vertexquery !== 'undefined') {
            pipeline = terminateVertexQuery(pipeline);
        }
        callback({ pipe: pipeline });
    } else {
        handleOptimizedQuery(query, query.plan, callback);
    }
};

function handleOptimizedQuery(query, plan, callback) {
    if (plan.esquery && !plan.anchor) {
        if (typeof plan.esquery.fields === 'undefined') {
            plan.esquery.fields = environment.esclient.fields;
        }
        if (environment.esclient.boost) {
            plan.esquery.query.query_string.query = plan.esquery.query.query_string.query + ' AND ' + environment.esclient.boost;
        }
        environment.esclient.search(environment.esclient.indexname, 'vertex', plan.esquery, function (err, data) {
            var records = [ ];
            var list = [ ];
            var count = 0;
            if (typeof err === 'undefined') {
                data = JSON.parse(data);
                if (typeof data.hits !== 'undefined' && data.hits.total > 0) {
                    count = data.hits.total;
                    data.hits.hits.forEach(function (hit) {
                        var rec = { };
                        rec._id = LongEncoding.decodeSync(hit._id);
                        list.push(rec._id);
                        if (plan.esonly) {
                            for (var key in hit.fields) {
                                rec[environment.esclient.index[key]] = hit.fields[key];
                            }
                            records.push(rec);
                        }
                    });
                }
            }
            if (plan.vertexquery.length > 0 || plan.pipeline.length > 0){
                handleVQandPipeline(query, plan, list, callback);
            } else {
                callback({
                    records: records,
                    list: list,
                    count: count
                });
            }
        });
    } else {
        handleVQandPipeline(query, plan, null, callback);
    }
}

function handleVQandPipeline(query, plan, list, callback) {
    var pipe;
    var op;
    list = list || query.anchor;
    if (list) {
        pipe = g.v(list);
        while ((op = plan.vertexquery.shift())) {
            pipe = pipe.has.apply(pipe, op);
        }
    } else {
        if (plan.vertexquery.length > 0) {
            pipe = graphstore.db.querySync();
            while ((op = plan.vertexquery.shift())) {
                if (op[1] === 'contains' && op.length === 3) {
                    op[1] = Text.CONTAINS;
                }
                pipe = pipe.hasSync.apply(pipe, op);
            }
            pipe = g.start(pipe.verticesSync());
        }
    }
    if (pipe) {
        while ((op = plan.pipeline.shift())) {
            pipe = pipe[Object.keys(op)[0]].apply(pipe, op[Object.keys(op)[0]]);
        }
        callback({
            pipe: pipe
        });
    } else {
        callback({ });
    }
}

function searchTree(tree, pipeline) {
    if (typeof tree === 'undefined') {
        return pipeline;
    }
    /*jshint -W086*/ /* No 'break' between cases */
    switch (tree[0]) {
    case 'AND':
        if (typeof optimizer.vertexquery !== 'undefined') {
            return searchTree(tree[1], searchTree(tree[2], pipeline));
        } else if (tree[1] && tree[2]) {
            return pipeline.and(searchTree(tree[1], g._()), searchTree(tree[2], g._()));
        } else if (tree[1]) {
            return searchTree(tree[1], pipeline);
        } else if (tree[2]) {
            return searchTree(tree[2], pipeline);
        }
    case 'OR':
        pipeline = terminateVertexQuery(pipeline);
        return pipeline.or(searchTree(tree[1], g._()), searchTree(tree[2], g._()));
    case 'NOT':
        pipeline = terminateVertexQuery(pipeline);
        return pipeline.except(searchTree(tree[1], pipeline));
    case 'HAS':
    case 'FACET':
        var value = searchTree(tree[2], null);
        switch (environment.indexes[tree[1]].type) {
        case 'property':
            if (typeof optimizer.vertexquery !== 'undefined') {
                optimizer.vertexquerylength++;
                optimizer.vertexquery = optimizer.vertexquery.hasSync(tree[1], value);
                return pipeline;
            } else {
                return pipeline.has(tree[1], value).back(1);
            }
        case 'text':
            if (typeof optimizer.vertexquery !== 'undefined') {
                value.split(' ').forEach(function (value) {
                    optimizer.vertexquerylength++;
                    optimizer.vertexquery = optimizer.vertexquery.hasSync(tree[1], Text.CONTAINS, value);
                });
                return pipeline;
            } else if (graphstore.getEngine() === 'titan') {
                var verts = new g.ArrayList();
                g.start(graphstore.db.querySync().hasSync(tree[1], Text.CONTAINS, value).verticesSync()).aggregate(verts).iterate();
                return pipeline.retain(verts);
            } else {
                return pipeline.filter("{it.data?.count('" + value.replace("'", "\\'") + "') >= 1}");
            }
        case 'dbcallback':
            pipeline = terminateVertexQuery(pipeline);
            return dbcallbacks[tree[1]](tree[2], pipeline);
        default:
            if (typeof optimizer.vertexquery !== 'undefined') {
                optimizer.gremlinops.push([ environment.indexes[tree[1]].type, tree[1], value ]);
            } else {
                return operations[environment.indexes[tree[1]].type](pipeline, tree[1], value);
            }
        }
    case 'PHRASE':
        return tree[1];
    case 'ATOM':
        return tree.slice(1).join(' ');
    case 'FLOAT':
        pipeline = searchTree(tree[1], pipeline);
        return searchTree(tree[2], pipeline);
    }
    /*jshint +W086*/
    return pipeline;
}

function terminateVertexQuery(pipeline) {
    if (typeof optimizer.vertexquery !== 'undefined') {
        if (optimizer.vertexquerylength > 0) {
            pipeline = g.start(optimizer.vertexquery.verticesSync().iteratorSync());
        }
        var op;
        while ((op = optimizer.gremlinops.pop())) {
            pipeline = operations[op[0]](pipeline, op[1], op[2]);
        }
        delete optimizer.vertexquery;
    }
    return pipeline;
}
