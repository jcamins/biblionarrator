#!/usr/bin/env node
var options = require('../../src/lib/cmd')("Load MARC21 bibliographic records", {
        'overwrite': {
            alias: 'o',
            default: true,
            boolean: true,
            describe: 'Overwrite matching records'
        },
        'reject': {
            default: 'import.rej',
            describe: 'File name in which to store rejected records'
        },
        'recordclass': {
            describe: 'Record class to use for records (overrides LDR/06)'
        }
    }),
    environment = require('../../src/lib/environment'),
    JSONImporter = require('bn-importers/lib/json'),
    graphstore = require('../../src/lib/environment').graphstore,
    models = require('../../src/models'),
    Record = models.Record,
    fs = require('fs');

graphstore.autocommit = false;

var importer = new JSONImporter({
    files: options._
});

var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;
var rejects = [ ];

var linklookup = { };

importer.on('record', function (record, mypromise) {
    var rec;
    var recordclass;
    if (options.recordclass) {
        recordclass = options.recordclass;
    } else {
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
    try {
        rec.save();
        var links = rec.getLinks();
        links.forEach(function (link) {
            var target = (link.match ? linklookup[JSON.stringify(link.match)] : undefined)
                         || linklookup[link.key];
            if (typeof target === 'undefined' && link.match) {
                target = Record.findOne(link.match);
            }
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
                if (link.match) {
                    linklookup[JSON.stringify(link.match)] = linklookup[link.key];
                }
                rec.link(link.label, target, link.properties);
                linkcount++;
            }
        });
        recordcount++;
    } catch (e) {
        console.log(e, e.stack);
        rejects.push(JSON.stringify(record));
    }
    mypromise.resolve();
});

importer.on('commit', function (promise) {
    graphstore.db.commitSync();
    promise.resolve(true);
});

importer.on('done', function () {
    console.log('Processed ' + mainrecordcount + ' and created ' + recordcount + ' records/' + linkcount + ' links');
    if (rejects.length > 0) {
        fs.writeFileSync(options.reject, rejects.join('\n'));
    }
    process.exit();
});
