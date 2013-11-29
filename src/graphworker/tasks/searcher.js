"use strict";
var search = require('../lib/search');

module.exports = function (input, callback) {
    if (typeof input.query.plan !== 'undefined' && typeof input.query.plan.esquery !== 'undefined') {
        input.query.plan.esquery.from = input.query.offset || 0;
        if (input.query.plan.esonly) {
            input.query.plan.esquery.size = input.query.perpage;
        } else {
            input.query.plan.esquery.size = Math.max(1000, input.query.perpage * 50);
        }
    }
    search(input.query, function (results) {
        if (results.records) {
            callback({
                records: results.records,
                count: results.count,
                summary: 'Search: ' + input.query.canonical
            });
        } else if (results.pipe) {
            var records = [ ], count = 0;
            results.pipe.as('result').range(input.query.offset, input.query.offset + input.query.size).toJSON(function (err, records) {
                if (records.length > input.query.size) {
                    records.pop();
                }
                callback({
                    records: records,
                    count: input.query.offset + records.length,
                    summary: 'Search: ' + input.query.canonical
                });
            });
        } else {
            callback({
                records: [ ],
                count: 0,
                summary: 'Search: ' + input.query.canonical
            });
        }
    });
};

module.exports.message = 'search';

