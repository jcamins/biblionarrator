var graphstore = require('bngraphstore'),
    g = graphstore(),
    inspect = require('eyes').inspector({maxLength: false});

inspect({ vertices: g.V().toJSON(), edges: g.E().toJSON() });
