var graphstore = require('../lib/graphstore'),
    g = graphstore(),
    Record = require('../models/record.js'),
    RecordType = require('../models/recordtype.js');

var records = {
    mylife: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["My life in America"]}},{"section":{"children":["Greatest book ever"]}}]}},
    },
    whynot: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["Why I don't eat fat"]}},{"section":{"children":["Not nearly as exciting as it sounds."]}}]}},
    },
    london: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["London"]}},{"section":{"children":["In England"]}}]}},
    },
    jackspratt: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["Jack Spratt"]}},{"section":{"children":["A British man with strict dietary requirements."]}}]}},
    },
    newyork: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["New York"]}},{"section":{"children":["In the US"]}}]}},
    },
    billybob: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["Billy Bob"]}},{"section":{"children":["A silly Southerner."]}}]}},
    },
    paris: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["Paris"]}},{"section":{"children":["In France"]}}]}},
    },
    johnsmith: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["John Smith"]}},{"section":{"children":["An intrepid explorer"]}}]}},
    },
    book: {
        key: 'book',
        model: 'recordtype',
    },
    person: {
        key: 'person',
        model: 'recordtype',
    },
    place: {
        key: 'place',
        model: 'recordtype',
    },
};

for (var key in records) {
    if (records[key].model === 'record') {
        records[key] = new Record(records[key]);
    } else if (records[key].model === 'recordtype') {
        records[key] = new RecordType(records[key]);
    }
    records[key].save();
};

records.mylife.link('author', records.johnsmith);
records.mylife.link('publicationplace', records.newyork);
records.whynot.link('author', records.jackspratt);
records.whynot.link('publicationplace', records.london);
records.jackspratt.link('livedin', records.london);
records.jackspratt.link('livedin', records.paris);
records.johnsmith.link('explored', records.paris);
records.johnsmith.link('explored', records.newyork);
records.mylife.link('recordtype', records.book);
records.whynot.link('recordtype', records.book);
records.jackspratt.link('recordtype', records.person);
records.johnsmith.link('recordtype', records.person);
records.billybob.link('recordtype', records.person);
records.paris.link('recordtype', records.place);
records.newyork.link('recordtype', records.place);
records.london.link('recordtype', records.place);
