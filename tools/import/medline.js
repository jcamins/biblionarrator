#!/usr/bin/env node
var options = require('../../src/lib/cmd'),
    XMLImporter = require('bn-importers/lib/xml'),
    graphstore = require('../../src/lib/environment').graphstore,
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType;

graphstore.autocommit = false;

var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;

var importer = new XMLImporter({
    files: [ options.argv[0] ],
    collect: [
        'Author',
        'Chemical',
        'MeshHeading',
        'QualifierName'
    ],
    recordElement: 'MedlineCitation'
});

importer.on('record', function (record, mypromise) {
    mainrecordcount++;
    recordcount++;
    var rec = new Record({ format: 'medline', data: record });
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
            rec.link(link.link, target);
            linkcount++;
        }
    });
    mypromise.resolve(true);
});

importer.on('commit', function (promise) {
    graphstore.db.commitSync();
    promise.resolve(true);
});

importer.on('done', function () {
    console.log('Processed ' + mainrecordcount + ' and created ' + recordcount + ' records/' + linkcount + ' links');
    process.exit();
});
