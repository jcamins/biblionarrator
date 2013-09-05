#!/usr/bin/env node
var XMLImporter = require('bn-importers/lib/xml'),
    graphstore = require('../../src/node_modules/bngraphstore'),
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType;

graphstore.autocommit = false;

var recordtypes = { };
recordtypes['person'] = RecordType.findOne({ key: 'Person' });
recordtypes['institution'] = RecordType.findOne({ key: 'Institution' });
if (typeof recordtypes['person'] === 'undefined') {
    recordtypes['person'] = new RecordType({
        key: 'Person',
        data: '{"article":{"children":[{"header":{"children":["Person"]}},{"section":{"children":["Individual people."]}}]}}',
        format: 'bnjson'
    });
    recordtypes['person'].save();
}
if (typeof recordtypes['institution'] === 'undefined') {
    recordtypes['institution'] = new RecordType({
        key: 'Institution',
        data: '{"article":{"children":[{"header":{"children":["Institution"]}},{"section":{"children":["Institutional entities."]}}]}}',
        format: 'bnjson'
    });
    recordtypes['institution'].save();
}
var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;

var importer = new XMLImporter({
    files: [ process.argv[2] ],
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
    mainrecordcount++;
    recordcount++;
    var rec = {
        title: record.metadata['dc:title'],
        source: record.metadata['dc:source'],
        citation: record.metadata['eric:citation'],
        description: record.metadata['dc:description'],
        publisher: record.metadata['dc:publisher'],
        types: [ ],
        subjects: [ ],
        creators: [ ]
    };
    var jj;
    for (jj in record.metadata['dc:identifier']) {
        if (record.metadata['dc:identifier'][jj]['$'].scheme === 'dcterms:URI') {
            rec.doi = record.metadata['dc:identifier'][jj]['$text'];
        } else if (record.metadata['dc:identifier'][jj]['$'].scheme === 'eric_accno') {
            rec.accno = record.metadata['dc:identifier'][jj]['$text'];
        }
    }
    for (jj in record.metadata['dc:creator']) {
        if (record.metadata['dc:creator'][jj]['$text']) {
            rec.creators.push(record.metadata['dc:creator'][jj]['$text']);
            if (typeof Record.findOne({ key: record.metadata['dc:creator'][jj]['$text'] }) === 'undefined') {
                if (record.metadata['dc:creator'][jj]['$'].scheme === 'personal author') {
                    childrec = new Record({
                        key: record.metadata['dc:creator'][jj]['$text'],
                        format: 'bnjson',
                        data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ record.metadata['dc:creator'][jj]['$text'] ] } }, ] } }, ] } }
                    });
                    childrec.save();
                    childrec.link('recordtype', recordtypes['person']);
                    childrec = null;
                    recordcount++;
                } else if (record.metadata['dc:creator'][jj]['$'].scheme === 'institution') {
                    childrec = new Record({
                        key: record.metadata['dc:creator'][jj]['$text'],
                        format: 'bnjson',
                        data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ record.metadata['dc:creator'][jj]['$text'] ] } }, ] } }, ] } }
                    });
                    childrec.save();
                    childrec.link('recordtype', recordtypes['institution']);
                    childrec = null;
                    recordcount++;
                }
            }
        }
    }
    for (var type in record.metadata['dc:type']) {
        type = record.metadata['dc:type'][type];
        if (typeof type === 'object' && type !== null) {
            type = type['$text'];
            rec.types.push(type);
        } else if (typeof type === 'string' && type.length > 0) {
            rec.types.push(type);
        } else {
            continue;
        }
        if (typeof RecordType.findOne({ key: type }) === 'undefined') {
            childrec = new RecordType({
                key: type,
                format: 'bnjson',
                data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ type ] } }, ] } }, ] } }
            });
            childrec.save();
            childrec = null;
            recordcount++;
        }
    }
    for (var subject in record.metadata['dc:subject']) {
        subject = record.metadata['dc:subject'][subject];
        if (typeof subject === 'object' && subject !== null) {
            subject = subject['$text'];
            rec.subjects.push(subject);
        } else if (typeof subject === 'string' && subject.length > 0) {
            rec.subjects.push(subject);
        }
    }
    rec = new Record({ format: 'eric', data: rec });
    rec.save();
    recordcount++;
    linkcount += handleLinks(rec);
    mypromise.resolve(true);
});

importer.on('commit', function (promise) {
    graphstore.getDB().commitSync();
    promise.resolve(true);
});

importer.on('done', function () {
    process.exit();
});

function handleLinks(rec) {
    var count = 0;
    var ref;
    if (rec.data.types.length > 0) {
        for (ref in rec.data.types) {
            ref = rec.data.types[ref];
            rec.link('recordtype', RecordType.findOne({ key: ref }));
            count++;
        }
    }
    if (rec.data.creators.length > 0) {
        for (ref in rec.data.creators) {
            ref = rec.data.creators[ref];
            rec.link('author', Record.findOne({ key: ref }));
            count++;
        }
    }
    if (rec.data.subjects.length > 0) {
        for (ref in rec.data.subjects) {
            ref = rec.data.subjects[ref];
            rec.link('subject', Record.findOne({ key: ref }));
            count++;
        }
    }
    return count;
}
