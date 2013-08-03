var fs = require('fs'),
    xml2js = require('xml2js'),
    inspect = require('eyes').inspector({maxLength: false}),
    datastore = require('../../lib/datastore'),
    Q = require('q');

var parser = new xml2js.Parser();
var recs = { };
var promises = [ ];
var filenames = process.argv.slice(2);
for (var arg in filenames) {
    console.log('Opening file ' + filenames[arg]);
    fs.readFile(filenames[arg], function(err, data) {
        parser.parseString(data, function (err, result) {
            var record;
            console.log('Processing ' + result.records.record.length + ' records');
            for (var ii in result.records.record) {
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
                for (var jj in record.metadata[0]['dc:identifier']) {
                    if (record.metadata[0]['dc:identifier'][jj]['$'].scheme === 'dcterms:URI') {
                        rec.doi = record.metadata[0]['dc:identifier'][jj]['_'];
                    } else if (record.metadata[0]['dc:identifier'][jj]['$'].scheme === 'eric_accno') {
                        rec.accno = record.metadata[0]['dc:identifier'][jj]['_'];
                    }
                }
                rec.creators = [];
                for (var jj in record.metadata[0]['dc:creator']) {
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
        
            console.log('Creating ' + promises.length + ' records');
            datastore.query('SELECT id, controlno FROM records', [ ], function (err, results) {
                recs = { };
                if (err) {
                    throw('unable to get subjects');
                } else {
                    for (var ii in results) {
                        recs[results[ii].controlno] = results[ii].id;
                    }
                    Q.all(promises).then(function (data) {
                        promises = [];
                        for (var ii in data) {
                            if (data[ii].accno) {
                                recs[data[ii].accno] = data[ii];
                            } else if (data[ii].article) {
                                recs[data[ii].article.children[0].header.children[0].span.children[0]] = data[ii].id;
                            }
                        }
                        for (var rec in recs) {
                            if (typeof recs[rec] === 'object') {
                                if (recs[rec].creators) {
                                    for (var ref in recs[rec].creators) {
                                        ref = recs[rec].creators[ref];
                                        if (recs[ref]) {
                                            promises.push(addLink(recs[rec].id, recs[ref], 1, 'By', 'Created'));
                                        }
                                    }
                                }
                                if (recs[rec].subjects) {
                                    for (var ref in recs[rec].subjects) {
                                        ref = recs[rec].subjects[ref];
                                        if (recs[ref]) {
                                            promises.push(addLink(recs[rec].id, recs[ref], 8, 'About', 'Topic of'));
                                        }
                                    }
                                }
                            }
                        }
                        console.log('Creating ' + promises.length + ' links');
                        return Q.all(promises);
                    }).then(function () {
                        console.log('done');
                        process.exit();
                    });
                }
            });
        });
    });
}

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

