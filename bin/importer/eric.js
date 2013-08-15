var fs = require('fs'),
    xml2js = require('xml2js'),
    graphstore = require('../../lib/graphstore'),
    models = require('../../models'),
    Record = models.Record,
    RecordType = models.RecordType,
    inspect = require('eyes').inspector({maxLength: false});
    Q = require('q');

graphstore.autocommit = false;
var parser = new xml2js.Parser();
var filename = process.argv[2]; // It would be great if we could do multiple files in parallel, but in practice the heap gets too big
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
Q.nfcall(fs.readFile, filename).then(function (data) {
    console.log('Parsing file ' + filename);
    return Q.nfcall(parser.parseString, data);
}).then(function (result) {
    var record;
    var linkcount = 0;
    var recordcount = 0;
    var childrec;
    console.log('Processing ' + result.records.record.length + ' records in ' + filename);
    for (var ii in result.records.record) {
        var jj;
        if (ii % 1000 === 0 && ii > 0) {
            console.log('... ' + ii + ' of ' + result.records.record.length);
        }
        record = result.records.record[ii];
        var rec = {
            title: record.metadata[0]['dc:title'][0],
            source: record.metadata[0]['dc:source'][0],
            citation: record.metadata[0]['eric:citation'][0],
            description: record.metadata[0]['dc:description'][0],
            publisher: record.metadata[0]['dc:publisher'][0],
            types: [ ],
            subjects: [ ],
            creators: [ ]
        };
        for (jj in record.metadata[0]['dc:identifier']) {
            if (record.metadata[0]['dc:identifier'][jj]['$'].scheme === 'dcterms:URI') {
                rec.doi = record.metadata[0]['dc:identifier'][jj]['_'];
            } else if (record.metadata[0]['dc:identifier'][jj]['$'].scheme === 'eric_accno') {
                rec.accno = record.metadata[0]['dc:identifier'][jj]['_'];
            }
        }
        for (jj in record.metadata[0]['dc:creator']) {
            if (record.metadata[0]['dc:creator'][jj]['_']) {
                rec.creators.push(record.metadata[0]['dc:creator'][jj]['_']);
                if (typeof Record.findOne({ key: record.metadata[0]['dc:creator'][jj]['_'] }) === 'undefined') {
                    if (record.metadata[0]['dc:creator'][jj]['$'].scheme === 'personal author') {
                        childrec = new Record({
                            key: record.metadata[0]['dc:creator'][jj]['_'],
                            format: 'bnjson',
                            data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ record.metadata[0]['dc:creator'][jj]['_'] ] } }, ] } }, ] } }
                        });
                        childrec.save();
                        childrec.link('recordtype', recordtypes['person']);
                        childrec = null;
                        recordcount++;
                    } else if (record.metadata[0]['dc:creator'][jj]['$'].scheme === 'institution') {
                        childrec = new Record({
                            key: record.metadata[0]['dc:creator'][jj]['_'],
                            format: 'bnjson',
                            data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ record.metadata[0]['dc:creator'][jj]['_'] ] } }, ] } }, ] } }
                        });
                        childrec.save();
                        childrec.link('recordtype', recordtypes['institution']);
                        childrec = null;
                        recordcount++;
                    }
                }
            }
        }
        for (var type in record.metadata[0]['dc:type']) {
            type = record.metadata[0]['dc:type'][type];
            if (typeof type === 'object' && type !== null) {
                type = type['_'];
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
        for (var subject in record.metadata[0]['dc:subject']) {
            subject = record.metadata[0]['dc:subject'][subject];
            if (typeof subject === 'object' && subject !== null) {
                subject = subject['_'];
                rec.subjects.push(subject);
            } else if (typeof subject === 'string' && subject.length > 0) {
                rec.subjects.push(subject);
            }
        }
        rec = new Record({ key: rec.accno, format: 'eric', data: rec });
        rec.save();
        recordcount++;
        linkcount += handleLinks(rec);
    }
    console.log('Created ' + recordcount + ' records, and ' + linkcount + ' links for ' + filename);
    graphstore.getDB().commitSync();
    process.exit();
}).done(function () {
}, function (error) {
    console.log('Encountered problems with ' + filename + ': ' + error);
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nMessage: ' + err.message);
        }
        if (err.stack) {
            console.log('\nStacktrace:');
            console.log('====================');
            console.log(err.stack);
        }
    }
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
