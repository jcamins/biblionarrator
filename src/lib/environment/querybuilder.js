"use strict";
var extend = require('extend');
var Text = { };

function QueryBuilder(config) {
    var self = this;
    var supports = { };

    this.build = function (ast) {
        return new QueryPlan(ast, supports, config);
    };

    if (config.graphstore.engine === 'titan') {
        supports.contains = true;
        Text = config.graphstore.g.java.import('com.thinkaurelius.titan.core.attribute.Text');
    }
    if (config.graphstore.searchbackend === 'elasticsearch') {
        supports.elasticsearch = true;
    }

    return self;
}

module.exports = QueryBuilder;

function QueryPlan(tree, supports, environment) {
    var self = this;
    self.partial = new PartialPlan();

    optimizeTree(tree, self.partial, supports, environment);

    self.vertexquery = self.partial.vertexq;
    self.pipeline = self.partial.pipeline;
    self.unoptimizable = self.partial.unoptimizable;

    if (supports.elasticsearch) {
        self.esquery = prepareESQuery(self.partial);
        self.esquery.size = 5000;
        if (self.vertexquery.length === 0 || self.pipeline.length === 0) {
            self.esonly = true;
        } else {
            self.esquery.fields = [ ];
        }
    }
    return self;
}

function PartialPlan(options) {
    this.nextlabel = 1;
    this.vertexq = [ ];
    this.textq = [ ];
    this.pipeline = [ ];
    this.length = 0;
    extend(this, options);
    return this;
}

function optimizeTree(tree, query, supports, environment) {
    var op;
    switch (tree[0]) {
    case 'AND':
        optimizeTree(tree[1], query, supports, environment);
        optimizeTree(tree[2], query, supports, environment);
        break;
    case 'NOT':
        var notplan = optimizeTree(tree[1], new PartialPlan(), supports, environment);
        query.unoptimizable = query.unoptimizable || notplan.unoptimizable;
        if (notplan.length === notplan.textq.length) {
            notplan.textq.forEach(function (textq) {
                query.textq.push({ not: textq });
            });
        } else if (notplan.length === notplan.pipeline.length) {
            query.pipeline = query.pipeline.concat(
                [ { as: 'trunk' + notplan.nextlabel } ],
                notplan.pipeline,
                [
                    { as: 'not' + (notplan.nextlabel + 1) },
                    { optional: 'trunk' + notplan.nextlabel },
                    { exceptStep: 'not' + (notplan.nextlabel + 1) }
                ]);
            query.nextlabel = notplan.nextlabel + 2;
        } else {
            query.unoptimizable = true;
        }
        break;
    case 'HAS':
    case 'FACET':
        query.length++;
        switch (environment.indexes[tree[1]].type) {
        case 'property':
            query.vertexq.push([ tree[1], analyzeValue(tree[2]) ]);
            break;
        case 'text':
            if (supports.elasticsearch) {
                query.textq.push(analyzeESValue(tree[2], environment.indexes[tree[1]].id));
            } else if (supports.contains) {
                analyzeContainsValue(tree[2]).forEach(function (value) {
                    query.vertexq.push([ tree[1], Text.CONTAINS, value ]);
                });
            } else {
                query.pipeline.push({ filter: "{it.data?.count('" + analyzeValue(tree[2]) + "') >= 1}" });
            }
            break;
        case 'edge':
            op = op || 'out';
        case 'inverseedge':
            op = op || 'in';
        case 'biedge':
            op = op || 'both';
            var pipeop = { };
            pipeop[op] = [ tree[1] ];
            query.pipeline = query.pipeline.concat([
                { as: [ 'trunk' + query.nextlabel ] },
                pipeop,
                { has: [ 'key', analyzeValue(tree[2]) ] },
                { back: [ 'trunk' + query.nextlabel ] }
            ]);
            query.nextlabel++;
            break;
        default:
            // TODO: Implement dbcallbacks
            query.unoptimizable = true;
            break;
        }
        break;
    //case 'FLOAT':
    //case 'OR':
    default:
        query.unoptimizable = true;
    }
    return query;
}

function analyzeESValue(tree, index) {
    var textValue = { "match" : { } };
    if (tree[0] === 'PHRASE') {
        textValue.match[index] = { query: tree[1], type: 'phrase' };
    } else {
        textValue.match[index] = { query: tree.slice(1).join(' ') };
    }
    return textValue;
}

function analyzeContainsValue(tree) {
    if (tree[0] === 'PHRASE') {
        return [ tree[1] ];
    } else {
        return tree.slice(1);
    }
}

function analyzeValue(tree) {
    if (tree[0] === 'PHRASE') {
        return tree[1];
    } else {
        return tree.slice(1).join(' ');
    }
}

function prepareESQuery(plan) {
    var query = { should: [ ], must_not: [ ] };
    for (var ii = 0; ii < plan.textq.length; ii++) {
        if (plan.textq[ii].not) {
            query.must_not.push(plan.textq[ii].not);
        } else {
            query.should.push(plan.textq[ii]);
        }
    }
    return { query: { bool: query }, size: 5000 };
}
