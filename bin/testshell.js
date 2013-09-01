var opts = {
    engine: 'titan',
    titan: {
        'storage.keyspace': 'bntest',
        'storage.index.search.backend': 'lucene',
        'storage.index.search.directory': __dirname + '/data/titanft',
        'storage.index.search.client-only': false,
    },

    orient: {
        path: 'local:' + __dirname + '/data/orient',
    },

    tinker: {
        path: null,
    },

    neo4j: {
        path: __dirname + '/data/neo4j',
    },
};

var expect = require('chai').expect,
    graphstore = require('../lib/graphstore'),
    g = graphstore(opts),
    models = require('../models'),
    Query = models.Query,
    searchengine = require('../lib/searchengine'),
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

r.on('exit', function () {
  console.log('Good-bye from Gremlin!');
  g.V().remove();
  process.exit();
});
