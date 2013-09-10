#!/usr/bin/env node
var JSONImporter = require('bn-importers/lib/json'),
    graphstore = require('../../src/node_modules/bngraphstore'),
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType;

graphstore.autocommit = false;

var importer = new JSONImporter({
    files: [ process.argv[2] ]
});

var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;

importer.on('record', function (record, mypromise) {
    mainrecordcount++;
    recordcount++;
    console.log(record);
});

importer.on('commit', function (promise) {
    graphstore.getDB().commitSync();
    promise.resolve(true);
});

importer.on('done', function () {
    process.exit();
});
