var path = require('path'),
    environment = require('../../src/lib/environment');

var config = {
    graphconf: {
        engine: 'titan',
        titan: {
            'storage.backend': 'cassandra',
            'storage.keyspace': 'bntest',
            'storage.index.search.backend': 'lucene',
            'storage.index.search.directory': path.resolve(__dirname, '../data/titanft'),
        },

        orient: {
            path: 'local:' + path.resolve(__dirname, '../data/orient'),
            "username": "admin",
            "password": "admin"
        },

        tinker: {
            path: null,
        },

        neo4j: {
            path: path.resolve(__dirname, '../data/neo4j'),
        }
    },
    dataconf: {
        namespace: 'test'
    },
    operators: {
       'AND': '&&',
       'OR': '\\|\\|',
       'FLOAT_START': '\\{\\{',
       'FLOAT_END': '\\}\\}',
       'GS': '\\(',
       'GE': '\\)',
       'REQ': '\\+',
       'DIS': '-',
       'MOD': '#',
       'NOT': '!',
       'FACET_START': '\\[',
       'FACET_END': '\\]',
       'FILTER_START': '(range)<',
       'FILTER_END': '>'
    },
    indexes: {
        author: {
            type: 'edge',
            unidirected: false
        },
        title: {
            type: 'text'
        },
        keyword: {
            type: 'text',
            unique: false,
            multivalue: false
        },
        key: {
            type: 'property',
            datatype: 'String',
            unique: true,
            multivalue: false
        },
        recordtype: {
            type: 'edge',
            unidirected: true
        },
        model: {
            type: 'property',
            datatype: 'String',
            unique: false,
            multivalue: false
        },
        linkbrowse: {
            type: 'dbcallback'
        },
        vorder: {
            type: 'property',
            datatype: 'Integer',
            unique: false,
            multivalue: false
        }
    },
    facets: {
        "author": {
            "outlabel": "By",
            "inlabel": "Wrote",
            "facetlabel": "Author"
        },
        "subject": {
            "outlabel": "About",
            "inlabel": "Topic of",
            "facetlabel": "Subject"
        },
        "recordtype": {
            "outlabel": "Is a",
            "inlabel": "Example of",
            "facetlabel": "Record type"
        }
    }
};

module.exports = config;

environment.set(config);
