var XMLImporter = require('bn-importers/lib/xml'),
    graphstore = require('../../src/node_modules/bngraphstore'),
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType,
    inspect = require('eyes').inspector({maxLength: false}),
    Q = require('q');

var recs = { };

var recordtypes = { };

recordtypes['ericterm'] = RecordType.findOne({ key: 'Term' });
recordtypes['ericsynonym'] = RecordType.findOne({key: 'Synonym' });

if (typeof recordtypes['ericterm'] === 'undefined' ) {
    recordtypes['ericterm'] =  new RecordType({
        key: 'Term',
        data: '{"article":{"children":[{"header":{"children":["Term"]}},{"section":{"children":["Terms established for use in the ERIC thesaurus."]}}]}}',
        format: 'bnjson'
    });
    recordtypes['ericterm'].save();
}
if (typeof recordtypes['ericsynonym'] === 'undefined' ) {
    recordtypes['ericsynonym'] = new RecordType({
        key: 'Synonym',
        data: '{"article":{"children":[{"header":{"children":["Synonym"]}},{"section":{"children":["Terms that are not used in ERIC."]}}]}}',
        format: 'bnjson'
    });
    recordtypes['ericsynonym'].save();
}

var importer = new XMLImporter({
    files: [ process.argv[2] ],
    collect: [
        'Attribute',
        'Relationship',
        'Is'
    ],
    recordElement: 'Term'
});

var linksleft = 0;
var totallinks = 0;

importer.on('record', function (term, mypromise) {
    var rec = { name: term.Name };
    var recordtype;
    var jj;
    inspect(term);
    for (jj in term.Attributes.Attribute) {
        if (term.Attributes.Attribute[jj]['$'].name === 'ScopeNote') {
            if (term.Attributes.Attribute[jj]['$text']) {
                rec.scope = term.Attributes.Attribute[jj]['$text'];
            }
        } else if (term.Attributes.Attribute[jj]['$'].name === 'RecType') {
            if (term.Attributes.Attribute[jj]['$text'] === 'Main') {
                recordtype = 'ericterm';
            } else if (term.Attributes.Attribute[jj]['$text'] === 'Synonym') {
                recordtype = 'ericsynonym';
            }
        }
    }
    for (jj in term.Relationships.Relationship) {
        if (term.Relationships.Relationship[jj]['$'].type === 'UF') {
            rec.synonyms = term.Relationships.Relationship[jj].Is;
        } else if (term.Relationships.Relationship[jj]['$'].type === 'BT') {
            rec.broader = term.Relationships.Relationship[jj].Is;
        } else if (term.Relationships.Relationship[jj]['$'].type === 'NT') {
            rec.narrower = term.Relationships.Relationship[jj].Is;
        } else if (term.Relationships.Relationship[jj]['$'].type === 'RT') {
            rec.related = term.Relationships.Relationship[jj].Is;
        } else if (term.Relationships.Relationship[jj]['$'].type === 'U') {
            rec.preferred = term.Relationships.Relationship[jj].Is;
        }
        linksleft += term.Relationships.Relationship[jj].Is.length;
    }
    totallinks += linksleft;
    rec = new Record({ format: 'ericthesaurus', data: rec});
    rec.save();
    rec.linksleft = linksleft;
    recordtype = recordtype || 'ericterm';
    rec.link('recordtype', recordtypes[recordtype]);
    recs[rec.key] = rec;
    handleLinks(rec.key);
    mypromise.resolve(rec);
});
importer.on('filefinish', function() {
    Object.keys(recs).forEach(handleLinks);
});

importer.on('done', function() {
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
