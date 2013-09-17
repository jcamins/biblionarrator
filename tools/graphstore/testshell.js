var config = {
    graphconf: {
        engine: 'titan',
        titan: {
            'storage.backend': 'cassandra',
            'storage.hostname': '127.0.0.1',
            'storage.keyspace': 'bntest',
            'storage.index.search.backend': 'lucene',
            'storage.index.search.directory': __dirname + '/data/titanft',
            'storage.index.search.client-only': false,
        },

        orient: {
            path: 'local:' + __dirname + '/data/orient',
            "username": "admin",
            "password": "admin"
        },

        tinker: {
            path: null,
        },

        neo4j: {
            path: __dirname + '/data/neo4j',
        }
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

var expect = require('chai').expect,
    environment = require('../../src/lib/environment');
    environment = environment.set(config);
var graphstore = environment.graphstore,
    g = graphstore.g,
    models = require('../../src/models'),
    Query = models.Query,
    searchengine = require('../../src/lib/searchengine'),
    repl = require("repl"),
    inspect = require('eyes').inspector({maxLength: false});

try {
    require(__dirname + '/gendata');
} catch (e) {
}

process.stdout.write('\n');
process.stdout.write('         \\,,,/' + '\n');
process.stdout.write('         (o o)' + '\n');
process.stdout.write('-----oOOo-(_)-oOOo-----' + '\n');

var r = repl.start({
  prompt: "gremlin> ",
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  writer: outFunc
});

function _isObject(o) {
  return toString.call(o) === '[object Object]';
}

function outFunc(it){ 
  var arr;
  if(_isObject(it) && it.Type == 'GremlinJSPipeline'){
      arr = it.toList();
      for (var i = 0, l = arr.sizeSync(); i < l; i++) {
          process.stdout.write('==>'+arr.getSync(i)+'\n');
      }
  } else {
      process.stdout.write('==>'+it+'\n');
  }
  return '';
}

r.context.g = g;
r.context.graphstore = graphstore;
r.context.inspect = inspect;
r.context.Text = g.java.import('com.thinkaurelius.titan.core.attribute.Text');
r.context.Query = Query;
r.context.searchengine = searchengine;
r.context.environment = environment;

r.on('exit', function () {
  console.log('Good-bye from Gremlin!');
  g.V().remove();
  process.exit();
});
