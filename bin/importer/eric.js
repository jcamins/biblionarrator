var fs = require('fs'),
    xml2js = require('xml2js'),
    datastore = require('../../lib/datastore'),
    Q = require('q');

var parser = new xml2js.Parser();
var filename = process.argv[2]; // It would be great if we could do multiple files in parallel, but in practice the heap gets too big
var recs = { };
Q.npost(datastore, 'query', ['SELECT id, controlno FROM records', [ ] ]).then(function (results) {
    for (var ii in results) {
        recs[results[ii].controlno] = results[ii].id;
    }
    return recs;
}).then(function () {
    console.log('Opening file ' + filename);
    return Q.nfcall(fs.readFile, filename);
}).then(function (data) {
    console.log('Parsing file ' + filename);
    return Q.nfcall(parser.parseString, data);
}).then(function (result) {
    var promises = [];
    var record;
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
            subjects: record.metadata[0]['dc:subject'],
            types: record.metadata[0]['dc:type'],
        };
        for (jj in record.metadata[0]['dc:identifier']) {
            if (record.metadata[0]['dc:identifier'][jj]['$'].scheme === 'dcterms:URI') {
                rec.doi = record.metadata[0]['dc:identifier'][jj]['_'];
            } else if (record.metadata[0]['dc:identifier'][jj]['$'].scheme === 'eric_accno') {
                rec.accno = record.metadata[0]['dc:identifier'][jj]['_'];
            }
        }
        rec.creators = [];
        for (jj in record.metadata[0]['dc:creator']) {
            if (record.metadata[0]['dc:creator'][jj]['_']) {
                rec.creators.push(record.metadata[0]['dc:creator'][jj]['_']);
                if (!recs[record.metadata[0]['dc:creator'][jj]['_']]) {
                    if (record.metadata[0]['dc:creator'][jj]['$'].scheme === 'personal author') {
                        recs[record.metadata[0]['dc:creator'][jj]['_']] = 1;
                        promises.push(addRecord({ "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ record.metadata[0]['dc:creator'][jj]['_'] ] } }, ] } }, ] } }, 2, record.metadata[0]['dc:creator'][jj]['_'], 'bnjson'));
                    } else if (record.metadata[0]['dc:creator'][jj]['$'].scheme === 'institution') {
                        recs[record.metadata[0]['dc:creator'][jj]['_']] = 1;
                        promises.push(addRecord({ "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ record.metadata[0]['dc:creator'][jj]['_'] ] } }, ] } }, ] } }, 19, record.metadata[0]['dc:creator'][jj]['_'], 'bnjson'));
                    }
                }
            }
        }
        promises.push(addRecord(rec, 20, rec.accno));
    }
    console.log('Ready to create ' + promises.length + ' records for ' + filename);
    return Q.all(promises);
}).then(function (data) {
    console.log('Finished creating records');
    var promises = [ ];
    var newrecs = [ ];
    for (var ii in data) {
        if (data[ii].article) {
            recs[data[ii].article.children[0].header.children[0].span.children[0]] = data[ii].id;
        } else {
            newrecs.push(data[ii]);
        }
    }
    newrecs.forEach(function (rec) {
        rec.creators.forEach(function (ref) {
            if (recs[ref]) {
                promises.push(addLink(rec.id, recs[ref], 1, 'Created', 'By'));
            }
        });
        rec.subjects.forEach(function (ref) {
            if (recs[ref]) {
                promises.push(addLink(rec.id, recs[ref], 8, 'Topic Of', 'About'));
            }
        });
    });
    console.log('Ready to create ' + promises.length + ' links for ' + filename);
    return Q.all(promises);
}).then(function () {
    console.log('Finished creating links');
    console.log('Successfully loaded ' + filename);
}).finally(function () {
    console.log('Finished ' + filename);
    process.exit();
});

function addLink(source, target, field, in_label, out_label) {
    var deferred = Q.defer();
    datastore.query('INSERT INTO record_links (source_id, target_id, field_id, in_label, out_label, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [ source, target, field, in_label, out_label ], function (err, results) {
        if (err) {
            console.log(err);
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
}

function addRecord(rec, recordtype, controlno, format) {
    var deferred = Q.defer();
    format = format || 'eric';
    datastore.query('INSERT INTO records (data, recordtype_id, collection_id, controlno, format, created_at, updated_at, deleted) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 0)', [ JSON.stringify(rec), recordtype, 1, controlno, format ], function (err, results) {
        if (err) {
            console.log(err);
            deferred.reject(err);
        } else {
            rec.id = results.insertId;
            deferred.resolve(rec);
        }
    });
    return deferred.promise;
}

