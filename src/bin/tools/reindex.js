"use strict";
var models = require('../../models'),
    Record = models.Record,
    graphstore = require('../../lib/graphstore'),
    g = graphstore();

graphstore.autocommit = false;

var ii = 0;
var iterator = g.V().iterator();
var v, rec, id;
/*jshint -W084*/ /* Assignment in loop */
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
/*jshint +W084*/
graphstore.getDB().commitSync();
