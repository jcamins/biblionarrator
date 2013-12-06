"use strict";
var environment = require('../../lib/environment'),
    graphstore = environment.graphstore,
    g = graphstore.g,
    Text = g.java.import('com.thinkaurelius.titan.core.attribute.Text'),
    LongEncoding = g.java.import('com.thinkaurelius.titan.util.encoding.LongEncoding');

module.exports = function Search (query, callback) {
    var plan = query.plan;
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
                if (typeof data === 'string') data = JSON.parse(data);
                if (typeof data.hits !== 'undefined' && data.hits.total > 0) {
                    count = data.hits.total;
                    data.hits.hits.forEach(function (hit) {
                        var rec = { };
                        rec._id = LongEncoding.decodeSync(hit._id).longValue;
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
};

function handlePipeline(query, plan, pipe, callback) {
    var op;
    if (plan.pipeline.length > 0 && Object.keys(plan.pipeline[0])[0] === 'start') {
        pipe = g.start.apply(g, plan.pipeline[0]['start']);
        plan.pipeline.shift();
    } else if (!pipe) {
        pipe = g.V();
    }
    while ((op = plan.vertexquery.shift())) {
        if (op[1] === 'contains' && op.length === 3) {
            op[1] = Text.CONTAINS;
        }
        pipe = pipe.has.apply(pipe, op);
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

function handleVQandPipeline(query, plan, list, callback) {
    list = list || query.anchor;
    if (list) {
        g.v(list, function (err, pipe) {
            handlePipeline(query, plan, pipe, callback);
        });
    } else {
        handlePipeline(query, plan, null, callback);
    }
}
