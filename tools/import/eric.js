#!/usr/bin/env node
var util = require('util'),
    options = require('../../src/lib/cmd'),
    XMLImporter = require('bn-importers/lib/xml'),
    graphstore = require('../../src/lib/environment').graphstore,
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType;

graphstore.autocommit = false;

var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;
var linklookup = { };

var importer = new XMLImporter({
    files: options.argv,
    collect: [
        'dc:creator',
        'dc:subject',
        'dc:type',
        'dc:identifier',
        'dcterms:educationLevel'
    ],
    recordElement: 'record'
});

importer.on('record', function (record, mypromise) {
    var rec = { metadata: { } };
    var newkey, key;
    for (key in record.metadata) {
        newkey = key.replace(':', '_');
        if (util.isArray(record.metadata[key])) {
            rec.metadata[newkey] = record.metadata[key];
        } else {
            rec.metadata[newkey] = record.metadata[key];
        }
    }
    var jj;
    var identifiers = { };
    if (rec.metadata.dc_identifier) {
        rec.metadata.dc_identifier.forEach(function (el) {
            if (el.$text) {
                key = el.$.scheme;
                newkey = key.replace(':', '_');
                identifiers[newkey] = identifiers[newkey] || [ ];
                identifiers[newkey].push(el.$text);
            }
        });
        rec.metadata.dc_identifier = identifiers;
    }
    var creators = { personal: [ ], institution: [ ] };
    if (rec.metadata.dc_creator) {
        rec.metadata.dc_creator.forEach(function (el) {
            if (el.$text) {
                if (el.$.scheme === 'personal author') {
                    creators.personal.push(el.$text);
                } else if (el.$.scheme === 'institution') {
                    creators.institution.push(el.$text);
                } else {
                    console.log('Unknown creator scheme: ' + el.$.scheme);
                }
            }
        });
       rec.metadata.dc_creator = creators;
    }
    var types = [ ];
    if (rec.metadata.dc_type) {
        rec.metadata.dc_type.forEach(function (el) {
            if (typeof el === 'object' && el !== null) {
                types.push(el.$text);
            } else if (typeof el === 'string' && el.length > 0) {
                types.push(el);
            }
        });
        rec.metadata.dc_type = types;
    }
    var subjects = [ ];
    if (rec.metadata.dc_subject) {
        rec.metadata.dc_subject.forEach(function (el) {
            if (typeof el === 'object' && el !== null) {
                subjects.push(el.$text);
            } else if (typeof el === 'string' && el.length > 0) {
                subjects.push(el);
            }
        });
        rec.metadata.dc_subject = subjects;
    }
    rec = new Record({ format: 'eric', data: rec, recordclass: 'biblio' });
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
    promise.resolve();
});

importer.on('filefinish', function () {
    console.log(mainrecordcount + '/' + recordcount + '/' + linkcount);
});

importer.on('done', function () {
    console.log(mainrecordcount + '/' + recordcount + '/' + linkcount);
    process.exit();
});
