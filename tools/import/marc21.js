#!/usr/bin/env node
var options = require('../../src/lib/cmd')("Load MARC21 bibliographic records", {
        'match': {
            alias: 'm',
            describe: 'Criterion for matching (index:field)'
        },
        'overlay': {
            alias: 'o',
            default: true,
            boolean: true,
            describe: 'Overlay matching records'
        },
        'skip': {
            boolean: true,
            describe: 'Skip matching records'
        },
        'reject': {
            default: 'import.rej',
            describe: 'File name in which to store rejected records'
        },
        'recordclass': {
            describe: 'Record class to use for records (overrides LDR/06)'
        },
        'commit': {
            default: 1000,
            describe: 'Number of records to process between commits'
        }
    }),
    environment = require('../../src/lib/environment'),
    JSONImporter = require('bn-importers/lib/json'),
    graphstore = require('../../src/lib/environment').graphstore,
    models = require('../../src/models'),
    Record = models.Record,
    MARCRecord = require('../../src/lib/marcrecord'),
    util = require('util'),
    fs = require('fs');
var inspect = require('eyes').inspector({maxLength: false});

graphstore.autocommit = false;

var importer = new JSONImporter({
    files: options._,
    commit: options.commit
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
    if (options.match) {
        var matchre = /^([^:]*):(...)(.*)?$/;
        var parts = matchre.exec(options.match);
        var marc = new MARCRecord(record);
        var matchpoint = { };
        var matchrec = function (field) {
            matchpoint[parts[1]] = field.string(parts[3]);
            return Record.findOne(matchpoint);
        };
        if (util.isArray(marc['f' + parts[2]])) {
            for (var ii = 0; ii < marc['f' + parts[2]].length; ii++) {
                if ( (rec = matchrec(marc['f' + parts[2]][ii])) ) break;
            }
        } else if (marc['f' + parts[2]]) {
            rec = matchrec(marc['f' + parts[2]]);
        }
    }
    if (!rec) {
        rec = new Record({ format: 'marc21', data: record, recordclass: recordclass });
    } else if (options.overlay) {
        rec.format = 'marc21';
        rec.data = record;
    } else {
        mypromise.resolve();
        return;
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
        mypromise.reject(record);
    }
    mypromise.resolve(record);
});

importer.on('commit', function (promise) {
    graphstore.db.commitSync();
    promise.resolve(true);
});

importer.on('done', function (rejects) {
    console.log('Processed ' + mainrecordcount + ' and created ' + recordcount + ' records/' + linkcount + ' links');
    if (rejects.length > 0) {
        fs.writeFileSync(options.reject, rejects.join('\n'));
    }
    process.exit();
});
