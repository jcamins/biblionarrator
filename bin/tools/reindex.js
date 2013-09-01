"use strict";
var models = require('../../models'),
    Record = models.Record,
    graphstore = require('../../lib/graphstore'),
    g = graphstore(),
    T = g.Tokens;

graphstore.autocommit = false;

var ii = 0;
var iterator = g.V().iterator();
var v, rec, id;
while (v = iterator.nextSync()) {
    if (ii % 1000 === 0 && ii > 0) {
        console.log('Finished ' + ii);
        graphstore.getDB().commitSync();
    }
    id = v.getIdSync();
    rec = Record.findOne({ id: id });
    rec.save();
    ii++;
}
graphstore.getDB().commitSync();
