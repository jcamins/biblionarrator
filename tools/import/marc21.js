#!/usr/bin/env node
var options = require('../../src/lib/cmd')("Load MARC21 bibliographic records", {
        'overwrite': {
            alias: 'o',
            default: true,
            boolean: true,
            describe: 'Overwrite matching records'
        }
    }),
    environment = require('../../src/lib/environment'),
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
    var rec;
    var recordclass;
    if (record.leader.charAt(6) === 'z') {
        recordclass = 'auth';
    } else if (record.leader.charAt(6) === 'w') {
        recordclass = 'classification';
    } else if (record.leader.charAt(6) === 'q') {
        recordclass = 'communityinfo';
    } else if (record.leader.charAt(6).match('[uvxy]')) {
        recordclass = 'holdings';
    } else {
        recordclass = 'biblio';
    }
    mainrecordcount++;
    rec = new Record({ format: 'marc21', data: record, recordclass: recordclass });
    if (environment.formats.marc[recordclass].key) {
        var oldrec = Record.findOne({ 'key': rec.key });
        if (oldrec && !options.overwrite) {
            mypromise.resolve();
            return;
        }
    }
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
