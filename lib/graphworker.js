var graphstore = require('./graphstore'),
    g = graphstore();

process.on('message', function (message) {
    if (message.facet) {
        var facets = new g.HashMap();
        for (var ii = 0; ii < message.facet.length; ii++) {
            if (message.facet[ii].substring(0, 2) === 'v[') {
                message.facet[ii] = message.facet[ii].substring(2, message.facet[ii].length - 1);
            }
        }
        g.v(message.facet).outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}").iterate();
        process.send(facets.toJSON());
    }
});
