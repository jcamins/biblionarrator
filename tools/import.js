#!/usr/bin/env node
var options = require('../src/lib/cmd')("Load records into Biblionarrator", {
        'format': {
            alias: 'f',
            describe: 'Data format to import'
        },
        'json': {
            alias: 'j',
            describe: 'Import JSON data',
            boolean: true
        },
        'xml': {
            alias: 'x',
            describe: 'Import XML data',
            boolean: true
        },
        'lookup': {
            alias: 'l',
            describe: 'Use a lookup table and create links retrospectively',
            boolean: true
        },
        'match': {
            alias: 'm',
            describe: 'Criterion for matching (index:field)'
        },
        'map': {
            describe: 'Remap a field using the CSV file. Specified as 500$a:file.csv'
        },
        'overlay': {
            alias: 'o',
            default: false,
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
            describe: 'Record class to use for records'
        },
        'commit': {
            default: 1000,
            describe: 'Number of records to process between commits'
        }
    }),
    environment = require('../src/lib/environment'),
    JSONImporter = require('bn-importers/lib/json'),
    XMLImporter = require('bn-importers/lib/xml'),
    graphstore = environment.graphstore,
    models = require('../src/models'),
    Record = models.Record,
    util = require('util'),
    fs = require('fs'),
    Q = require('q'),
    extend = require('extend'),
    handler = require('../src/lib/formats/' + options.format);
var inspect = require('eyes').inspector({maxLength: false});

graphstore.autocommit = false;

var importer,
    importopts = {
        files: options._,
        commit: options.commit,
        pause: (options.map ? true : false)
    };
if (typeof handler.importoptions !== 'undefined') {
    extend(true, importopts, handler.importoptions);
}
if (options.xml) {
    importer = new XMLImporter(importopts);
} else {
    importer = new JSONImporter(importopts);
}

var maps = { };

if (options.map) {
    var csv = require('csv');
    var mappromises = [ ];
    if (util.isArray(options.map)) {
        options.map.forEach(function (map) {
            var prom = Q.defer();
            addMap(map, prom);
            mappromises.push(prom.promise);
        });
    } else {
        var prom = Q.defer();
        addMap(options.map, prom);
        mappromises.push(prom.promise);
    }
    Q.all(mappromises).done(function () {
        importer.start();
    });
}

var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;
var rejects = [ ];

var lookup = { }, linksleft = { };

importer.on('record', function (record, mypromise) {
    mainrecordcount++;
    var rec;
    var matcher = function (matchpoint) {
        return (rec = Record.findOne(matchpoint));
    };
    record = handler.import(record, options, maps, matcher);
    if (!rec) {
        rec = new Record(record);
    } else if (options.overlay) {
        rec.format = options.format;
        rec.data = record.data;
    } else {
        mypromise.resolve();
        return;
    }
    try {
        rec.save();
        if (typeof rec.key !== 'undefined') lookup[rec.key] = rec.id;
        var links = rec.getLinks();
        links.forEach(function (link) {
            var target = (link.match ? lookup[JSON.stringify(link.match)] : undefined)
                         || lookup[link.key];
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
                lookup[link.key] = lookup[link.key] || target.id;
                if (link.match) {
                    lookup[JSON.stringify(link.match)] = lookup[link.key];
                }
                rec.link(link.label, target, link.properties);
                linkcount++;
            } else if (options.lookup) {
                linksleft[link.key] = linksleft[link.key] || [ ];
                link.source = rec.id;
                linksleft[link.key].push(link);
            }
        });
        if (options.lookup && typeof rec.key !== 'undefined') {
            if (linksleft[rec.key]) {
                linksleft[rec.key].forEach(function (link) {
                    rec.link(link.label, link.source, link.properties, true);
                    linkcount++;
                });
                delete linksleft[rec.key];
            }
            lookup[rec.key] = rec.id;
        }
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
    if (typeof rejects !== 'undefined' && rejects.length > 0) {
        fs.writeFileSync(options.reject, rejects.join('\n'));
    }
    process.exit();
});

function addMap(map, promise) {
    var map = map.match(/^([0-9]{3})(.):(.*)$/);
    maps[map[1]] = maps[map[1]] || { };
    maps[map[1]][map[2]] = maps[map[1]][map[2]] || { };
    csv().from.path(map[3]).to.array(function (rows) {
        rows.forEach(function (row, index) {
            if (index > 0) {
                maps[map[1]][map[2]][row[0]] = row[1];
            }
        });
        promise.resolve(true);
    });
}

