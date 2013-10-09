#!/usr/bin/env node
var options = require('../../src/lib/cmd')("Load MARC21 bibliographic records"),
    JSONImporter = require('bn-importers/lib/json'),
    graphstore = require('../../src/lib/environment').graphstore,
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType;

graphstore.autocommit = false;

var importer = new JSONImporter({
    files: options._
});

var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;

var linklookup = { };

importer.on('record', function (record, mypromise) {
    var rec = new Record({ format: 'marc21', data: record, recordclass: 'biblio' });
    rec.save();
    var links = rec.getLinks();
    links.forEach(function (link) {
        var target = linklookup[link.key];
        if (typeof target === 'undefined') {
            target = Record.findOne({ key: link.key });
        }
        if (typeof target === 'undefined' && typeof link.vivify === 'object') {
            target = new Record(link.vivify);
            target.save();
            recordcount++;
        }
        if (typeof target !== 'undefined') {
            linklookup[link.key] = linklookup[link.key] || target.id;
            rec.link(link.label, target, link.properties);
            linkcount++;
        }
    });
    mainrecordcount++;
    recordcount++;
    mypromise.resolve();
});

importer.on('commit', function (promise) {
    graphstore.db.commitSync();
    promise.resolve(true);
});

importer.on('done', function () {
    console.log('Processed ' + mainrecordcount + ' and created ' + recordcount + ' records/' + linkcount + ' links');
    process.exit();
});
