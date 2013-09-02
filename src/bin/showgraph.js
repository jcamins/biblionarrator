var graphstore = require('../lib/graphstore'),
    g = graphstore(),
    inspect = require('eyes').inspector({maxLength: false});

inspect({ vertices: g.V().toJSON(), edges: g.E().toJSON() });
