var fs = require('fs'),
    xml2js = require('xml2js'),
    graphstore = require('../../lib/graphstore'),
    Record = require('../../models/record'),
    RecordType = require('../../models/recordtype'),
    Q = require('q');

var parser = new xml2js.Parser();
var recs = { };

graphstore.autocommit = false;

var recordtypes = {
    ericterm:  new RecordType({
        key: 'Term',
        data: '{"article":{"children":[{"header":{"children":["Term"]}},{"section":{"children":["Terms established for use in the ERIC thesaurus."]}}]}}',
        format: 'bnjson'
    }),
    ericsynonym: new RecordType({
        key: 'Synonym',
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
    var term;
    console.log('Processing ' + result.Nstein.Terms[0].Term.length + ' records in ' + filename);
    lasttime = process.hrtime();
    var totallinks = 0;
    for (var ii in result.Nstein.Terms[0].Term) {
        if (ii % 1000 === 0 && ii > 0) {
            lasttime = process.hrtime(lasttime);
            console.log("\t Processed 1k records ending in " + ii + ' of ' + result.Nstein.Terms[0].Term.length + ' in ' + (lasttime[0] + lasttime[1] * 1e-9) + ' secs');
        }
        term = result.Nstein.Terms[0].Term[ii];
        var linksleft = 0;
        var rec = { name: term.Name[0] };
        var recordtype;
        var jj;
        for (jj in term.Attributes[0].Attribute) {
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
        for (jj in term.Relationships[0].Relationship) {
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
            linksleft += term.Relationships[0].Relationship[jj].Is.length;
        }
        totallinks += linksleft;
        rec = new Record({ key: term.Name[0], format: 'ericthesaurus', data: rec});
        rec.save();
        rec.linksleft = linksleft;
        recordtype = recordtype || 'ericterm';
        rec.link('recordtype', recordtypes[recordtype]);
        recs[rec.key] = rec;
        handleLinks(rec.key);
    }
    Object.keys(recs).forEach(handleLinks);
    process.on('exit', function () {
        console.log('Had ' + Object.keys(recs).length + ' records with unresolved edges');
        console.log('Found a total of ' + totallinks + ' links');
    });
    console.log('Successfully loaded ' + filename);
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
    if (typeof recs[rec] === 'undefined') {
        return;
    }
    var ref;
    for (ref in recs[rec].data.broader) {
        ref = recs[rec].data.broader[ref];
        if (recs[ref]) {
            recs[rec].link('broader', recs[ref]);
            recs[rec].linksleft--;
            if (--recs[ref].linksleft <= 0) {
                delete recs[ref];
            }
        }
    }
    var idx;
    for (ref in recs[rec].data.related) {
        ref = recs[rec].data.related[ref];
        if (recs[ref]) {
            recs[rec].link('related', recs[ref]);
            recs[rec].linksleft--;
            if ((idx = recs[ref].data.related.indexOf(rec)) !== -1) {
                recs[ref].data.related.splice(idx, 1);
            }
            if (--recs[ref].linksleft <= 0) {
                delete recs[ref];
            }
        }
    }
    for (ref in recs[rec].data.preferred) {
        ref = recs[rec].data.preferred[ref];
        if (recs[ref]) {
            recs[rec].link('preferred', recs[ref]);
            recs[rec].linksleft--;
            if (--recs[ref].linksleft <= 0) {
                delete recs[ref];
            }
        }
    }
    if (recs[rec].linksleft <= 0) {
        delete recs[rec];
    }
}
