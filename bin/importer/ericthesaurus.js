var fs = require('fs'),
    xml2js = require('xml2js'),
    inspect = require('eyes').inspector({maxLength: false}),
    graphstore = require('../../lib/graphstore'),
    Record = require('../../models/record'),
    RecordType = require('../../models/recordtype'),
    g = graphstore(),
    Q = require('q');

var parser = new xml2js.Parser();
var recs = { };
var promises = [ ];
var broader = [ ];
var related = [ ];
var preferred = [ ];

var recordtypes = {
    ericterm:  new RecordType({
        key: 'ericterm',
        data: '{"article":{"children":[{"header":{"children":["Term"]}},{"section":{"children":["Terms established for use in the ERIC thesaurus."]}}]}}',
        format: 'bnjson'
    }),
    ericsynonym: new RecordType({
        key: 'ericsynonym',
        data: '{"article":{"children":[{"header":{"children":["Synonym"]}},{"section":{"children":["Terms that are not used in ERIC."]}}]}}',
        format: 'bnjson'
    }),
};
recordtypes['ericterm'].save();
recordtypes['ericsynonym'].save();

var filename = process.argv[2]; // It would be great if we could do multiple files in parallel, but in practice the heap gets too big

var lasttime;

Q.nfcall(fs.readFile, filename).then(function (data) {
    console.log('Parsing file ' + filename);
    return Q.nfcall(parser.parseString, data);
}).then(function (result) {
    var promises = [];
    var term;
    console.log('Processing ' + result.Nstein.Terms[0].Term.length + ' records in ' + filename);
    lasttime = process.hrtime();
    for (var ii in result.Nstein.Terms[0].Term) {
        if (ii % 1000 === 0 && ii > 0) {
            lasttime = process.hrtime(lasttime);
            console.log("\t Processed 1k records ending in " + ii + ' of ' + result.Nstein.Terms[0].Term.length + ' in ' + (lasttime[0] + lasttime[1] * 1e-9) + ' secs');
            promises.push(recHeapProcessor());
        }
        term = result.Nstein.Terms[0].Term[ii];
        var linksleft;
        var rec = { name: term.Name[0] };
        var recordtype;
        for (var jj in term.Attributes[0].Attribute) {
            if (term.Attributes[0].Attribute[jj]['$'].name === 'ScopeNote') {
                if (term.Attributes[0].Attribute[jj]['_']) {
                    rec.scope = term.Attributes[0].Attribute[jj]['_'];
                }
            } else if (term.Attributes[0].Attribute[jj]['$'].name === 'RecType') {
                if (term.Attributes[0].Attribute[jj]['_'] === 'Main') {
                    recordtype = 'ericterm';
                } else if (term.Attributes[0].Attribute[jj]['_'] === 'Synonym') {
                    recordtype = 'ericsynonym';
                }
            }
        }
        for (var jj in term.Relationships[0].Relationship) {
            if (term.Relationships[0].Relationship[jj]['$'].type === 'UF') {
                rec.synonyms = term.Relationships[0].Relationship[jj].Is;
            } else if (term.Relationships[0].Relationship[jj]['$'].type === 'BT') {
                rec.broader = term.Relationships[0].Relationship[jj].Is;
            } else if (term.Relationships[0].Relationship[jj]['$'].type === 'NT') {
                rec.narrower = term.Relationships[0].Relationship[jj].Is;
            } else if (term.Relationships[0].Relationship[jj]['$'].type === 'RT') {
                rec.related = term.Relationships[0].Relationship[jj].Is;
            } else if (term.Relationships[0].Relationship[jj]['$'].type === 'U') {
                rec.preferred = term.Relationships[0].Relationship[jj].Is;
            }
            linksleft++;
        }
        rec = new Record({ key: term.Name[0], data: rec});
        rec.save();
        rec.linksleft = linksleft;
        recordtype = recordtype || 'ericterm';
        rec.link('recordtype', recordtypes[recordtype]);
        rec = handleLinks(rec);
        if (rec.linksleft > 0) {
            recs[rec.key] = rec;
        }
    }
    promises.push(recHeapProcessor());
    return Q.all(promises);
}).done(function () {
    console.log('Successfully loaded ' + filename);
    process.exit();
}, function (error) {
    console.log('Encountered problems with ' + filename + ': ' + error);
    process.exit();
});

function recHeapProcessor() {
    return Q.delay(10).then(function () {
        for (var key in recs) {
            recs[key] = handleLinks(recs[key])
        }
    });
}

function handleLinks(rec) {
    for (var rec in recs) {
        for (var ref in recs[rec].broader) {
            ref = recs[rec].broader[ref];
            if (recs[ref]) {
                rec.link('broader', recs[ref]);
                rec.linksleft--;
                if (--recs[ref] <= 0) {
                    delete recs[ref];
                }
            }
        }
        for (var ref in recs[rec].related) {
            ref = recs[rec].related[ref];
            if (recs[ref]) {
                rec.link('related', recs[ref]);
                rec.linksleft--;
                if (--recs[ref] <= 0) {
                    delete recs[ref];
                }
            }
        }
        for (var ref in recs[rec].preferred) {
            ref = recs[rec].preferred[ref];
            if (recs[ref]) {
                rec.link('preferred', recs[ref]);
                rec.linksleft--;
                if (--recs[ref] <= 0) {
                    delete recs[ref];
                }
            }
        }
    }
    return rec;
}
