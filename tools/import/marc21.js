#!/usr/bin/env node
var JSONImporter = require('bn-importers/lib/json'),
    graphstore = require('../../src/node_modules/bngraphstore'),
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType;
var inspect = require('eyes').inspector({maxLength: false});

graphstore.autocommit = false;

var importer = new JSONImporter({
    files: [ process.argv[2] ]
});

var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;

importer.on('record', function (record, mypromise) {
    var rec = new Record({ format: 'marc21', data: record });
    rec.save();
    mainrecordcount++;
    recordcount++;
});

importer.on('commit', function (promise) {
    graphstore.getDB().commitSync();
    promise.resolve(true);
});

importer.on('done', function () {
    process.exit();
});
