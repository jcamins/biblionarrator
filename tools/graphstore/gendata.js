var models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType;

var records = {
    mylife: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["My life in America"]}},{"section":{"children":["Greatest book ever"]}}]}},
        key: 'My life in America'
    },
    whynot: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["Why I don't eat fat"]}},{"section":{"children":["Not nearly as exciting as it sounds."]}}]}},
        key: "Why I don't eat fat"
    },
    london: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["London"]}},{"section":{"children":["In England"]}}]}},
        key: 'London'
    },
    jackspratt: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["Jack Spratt"]}},{"section":{"children":["A British man with strict dietary requirements."]}}]}},
        key: 'Jack Spratt'
    },
    newyork: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["New York"]}},{"section":{"children":["In the US"]}}]}},
        key: 'New York'
    },
    billybob: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["Billy Bob"]}},{"section":{"children":["A silly Southerner."]}}]}},
        key: 'Billy Bob'
    },
    paris: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["Paris"]}},{"section":{"children":["In France"]}}]}},
        key: 'Paris'
    },
    johnsmith: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["John Smith"]}},{"section":{"children":["An intrepid explorer who originally lived in France"]}}]}},
        key: 'John Smith'
    },
    1580: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["1580"]}},{"section":{"children":["A good year"]}}]}},
        key: '1580'
    },
    1589: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["1589"]}},{"section":{"children":["A not-so-good year"]}}]}},
        key: '1589'
    },
    1631: {
        format: 'bnjson',
        deleted: 0,
        model: 'record',
        data: {"article":{"children":[{"header":{"children":["1631"]}},{"section":{"children":["A tragic year"]}}]}},
        key: '1631'
    },
    date: {
        key: 'date',
        model: 'recordtype',
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
}

records.mylife.link('author', records.johnsmith);
records.mylife.link('pubplace', records.newyork);
records.mylife.link('pubdate', records['1589']);
records.whynot.link('author', records.jackspratt);
records.whynot.link('pubplace', records.london);
records.whynot.link('pubdate', records['1589']);
records.jackspratt.link('birthdate', records['1580']);
records.jackspratt.link('deathdate', records['1589']);
records.johnsmith.link('birthdate', records['1580']);
records.johnsmith.link('deathdate', records['1631']);
records.mylife.link('recordtype', records.book);
records.whynot.link('recordtype', records.book);
records.jackspratt.link('recordtype', records.person);
records.johnsmith.link('recordtype', records.person);
records.billybob.link('recordtype', records.person);
records.paris.link('recordtype', records.place);
records.newyork.link('recordtype', records.place);
records.london.link('recordtype', records.place);
records['1580'].link('recordtype', records.date);
records['1589'].link('recordtype', records.date);
records['1631'].link('recordtype', records.date);
