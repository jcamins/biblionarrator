var options = require('../../src/lib/cmd'),
    XMLImporter = require('bn-importers/lib/xml'),
    graphstore = require('../../src/lib/environment').graphstore,
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType;
var inspect = require('eyes').inspector({maxLength: false});

graphstore.autocommit = false;

var importer = new XMLImporter({
    files: options.argv,
    collect: [
        'Attribute',
        'Relationship',
        'Is'
    ],
    recordElement: 'Term'
});

var linklookup = { }
var linksleft = { };
var mainrecordcount = 0, recordcount = 0, linkcount = 0;

importer.on('record', function (term, mypromise) {
    var rec = { Name: term.Name, Attributes: { }, Relationships: { } };
    term.Attributes.Attribute.forEach(function (el) {
        if (el.$text) {
            rec.Attributes[el.$.name] = rec.Attributes[el.$.name] || [ ];
            rec.Attributes[el.$.name].push(el.$text);
        }
    });
    if (term.Relationships && term.Relationships.Relationship) {
        term.Relationships.Relationship.forEach(function (el) {
            rec.Relationships[el.$.type] = rec.Relationships[el.$.type] || [ ];
            el.Is.forEach(function (is) {
                if (typeof is === 'object' && is !== null) {
                    rec.Relationships[el.$.type].push(is.$text);
                } else if (typeof is === 'string' && is.length > 0) {
                    rec.Relationships[el.$.type].push(is);
                }
            });
        });
    }
    rec = new Record({ format: 'ericthesaurus', data: rec, recordclass: (rec.Attributes.RecType && rec.Attributes.RecType[0] === 'Main' ? 'term' : 'synonym') });
    rec.save();
    var links = rec.getLinks();
    links.forEach(function (link) {
        var target = linklookup[link.key];
        if (typeof target === 'undefined') {
            target = Record.findOne({ key: link.key });
        }
        if (typeof target === 'undefined' && link.label !== 'related') {
            linksleft[link.key] = linksleft[link.key] || [ ];
            link.source = rec.id;
            linksleft[link.key].push(link);
        } else if (target) {
            linklookup[link.key] = linklookup[link.key] || target.id;
            rec.link(link.label, target, link.properties);
            linkcount++;
        }
    });
    if (linksleft[rec.key]) {
        linksleft[rec.key].forEach(function (link) {
            rec.link(link.label, link.source, link.properties, true);
            linkcount++;
        });
        delete linksleft[rec.key];
    }
    linklookup[rec.key] = rec.id;
    mainrecordcount++;
    recordcount++;
    mypromise.resolve();
});

importer.on('commit', function (promise) {
    graphstore.db.commitSync();
    promise.resolve();
});

importer.on('done', function() {
    console.log(mainrecordcount + '/' + recordcount + '/' + linkcount);
    process.exit();
});

