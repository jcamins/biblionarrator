"use strict";
var environment = require('../../lib/environment'),
    search = require('../lib/search'),
    graphstore = environment.graphstore,
    g = graphstore.g,
    linktypes = environment.facets;

module.exports = function (input, callback) {
    if (typeof input.query.plan !== 'undefined' && typeof input.query.plan.esquery !== 'undefined') {
        input.query.plan.esquery.fields = [ ];
        input.query.plan.esquery.size = 1000;
    }
    search(input.query, function (results) {
        var count;
        var pipeline;
        var countlist;
        if (results.list) {
            pipeline = g.v(results.list);
            count = results.list.length;
        } else if (results.pipe) {
            countlist = new g.ArrayList();
            pipeline = results.pipe.store(countlist);
        } else {
            callback({ });
        }
        var facets = new g.HashMap();
        var relfaceter = false;
        try {
            if (relfaceter) {
                pipeline.copySplit(g._().outE().groupCount(facets, "{it.label + '@out@' + it.inV?.key?.next()}"), g._().inE().groupCount(facets, "{it.label + '@in@' + it.outV?.key?.next()}")).fairMerge().iterate();
            } else {
                pipeline.outE().groupCount(facets, "{it.label + '@out@' + it.inV?.key?.next()}").iterate();
            }
        } catch (err) {
            // If we can't generate facets, the next best option is to deny their existence.
            return { };
        }
        if (typeof countlist !== 'undefined') {
            count = countlist.length;
        }
        var rawfacets =  facets.toJSON();
        facets = { };
        var parts, linktype;
        var edgeoptions = { };
        for (var key in rawfacets) {
            parts = key.split('@');
            linktype = linktypes[parts[0]];
            if (linktype && parts[1] === 'out' && (rawfacets[key] > 1 || rawfacets[key] >= count - 1)) {
                facets[parts[0]] = facets[parts[0]] || { label: linktype['facetlabel'], options: [ ], coverage: 0 };
                facets[parts[0]].options.push({ label: parts[2], link: encodeURIComponent(parts[0] + '["' + parts[2] + '"]'), count: rawfacets[key], type: parts[0] });
                facets[parts[0]].coverage += rawfacets[key];
            }
            if (relfaceter) {
                edgeoptions[parts[0] + '@' + parts[1]] = edgeoptions[parts[0] + '@' + parts[1]] || { label: linktype[parts[1] + 'label'], link: encodeURIComponent(parts[1] + '[' + parts[0] + ']'), count: 0 };
                edgeoptions[parts[0] + '@' + parts[1]].count = edgeoptions[parts[0] + '@' + parts[1]].count + rawfacets[key];
            }
        }
        var relationshipfacet = { label: 'Relationships', options: [ ] };
        if (relfaceter) {
            for (var edge in edgeoptions) {
                relationshipfacet.options.push(edgeoptions[edge]);
            }
            relationshipfacet.options = relationshipfacet.options.sort(function (a, b) {
                    return b.count - a.count || a.label.localeCompare(b.label);
                    });
        }
        var facetarray = [ ];
        for (var facet in facets) {
            facets[facet].options = facets[facet].options.sort(function (a, b) {
                return b.count - a.count || a.label.localeCompare(b.label);
            });
            facets[facet].more = facets[facet].options.length > 8 ? facets[facet].options.length - 5 : false;
            facets[facet].coverage = Math.abs(count - facets[facet].coverage);
            if (facets[facet].options.length > 0) {
                facetarray.push(facets[facet]);
            }
        }
        facetarray.sort(function (a, b) {
            return a.coverage - b.coverage || a.options.length - b.options.length;
        });
        callback({ relationships: relationshipfacet, facets: facetarray, faceter: input.faceter || 'standard', count: count || 0 });
    });
};

module.exports.message = 'facet';
