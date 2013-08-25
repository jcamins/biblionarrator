"use strict";
var config = require('../../config/searchengine'),
    extend = require('extend'),
    graphstore = require('../graphstore'),
    g = graphstore();
var inspect = require('eyes').inspector({maxLength: false});

module.exports = function (input) {
    var records;
    var edges;
    var list = new g.ArrayList();
    var count = new g.HashMap();
    var recordtypes = new g.ArrayList();
    input.depth = input.depth || 1;
    var pipeline = g.v(input.records);
    while (input.depth-- > 0) {
        pipeline = pipeline.both();
        console.log('going deeper');
    }
    records = pipeline.groupCount(count).cap().orderMap(g.Tokens.decr).range(0, input.size).as('me').aggregate(list).out('recordtype').property('key').store(recordtypes).back('me').toJSON();
    edges = g.start(list).bothE().toJSON();
    count = count.toJSON();
    recordtypes = recordtypes.toJSON();

    var recmap = { };
    records.forEach(function (rec, index) {
        records[index].recordtype = recordtypes[index];
        recmap[rec._id] = index;
    });
    var needed = [ ];
    if (typeof input.landmarks !== 'undefined') {
        input.landmarks.forEach(function (landmark) {
            if (typeof recmap[landmark] === 'undefined') {
                needed.push(landmark);
            }
        });
        if (needed.length > 0) {
            recordtypes = new g.ArrayList();
            var landmarks = g.V(needed).out('recordtype').property('key').store(recordtypes).toJSON();
            recordtypes = recordtypes.toJSON();
            landmarks.forEach(function (landmark, index) {
                landmark.recordtype = recordtypes[index];
                recmap[landmark._id] = records.push(landmark) - 1;
            });
        }
    }
    var removes = [ ];
    for (var ii = 0; ii < edges.length; ii++) {
        edges[ii].source = recmap[edges[ii]._inV];
        edges[ii].target = recmap[edges[ii]._outV];
        if (typeof edges[ii].source === 'undefined' || typeof edges[ii].target === 'undefined') {
            removes.unshift(ii);
        }
    }
    removes.forEach(function (ii) {
        edges.splice(ii, 1);
    });
    return { records: records, recmap: recmap, edges: edges, landmarks: input.landmarks };
};

module.exports.message = 'map';
