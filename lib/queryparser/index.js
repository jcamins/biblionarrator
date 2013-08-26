var qp = require('./qp'),
    extend = require('extend'),
    linktypes = require('../../config/linktypes');

module.exports = {
    initialize: function (config) {
        qp.initialize(config);
    },
    qp: qp,
    parse: qp.parse,
    decompose: function (ast) {
        var decomposed = decompose(ast);
        return {
            canonical: decomposed.canonical || '',
            facets: decomposed.flat.facet || [],
            offset: decomposed.flat.offset || 0,
            perpage: decomposed.flat.perpage || 20
        };
    }
}

var flatteners = {
    'AND': function (tree) {
        var flat = { };
        extend(true, flat, tree[1].flat, tree[2].flat);
        return flat;
    },
    'FILTER': function (tree) {
        var args = tree[2].flat.split(' ');
        switch(tree[1]) {
        case 'range':
            return { 
                offset: args[0],
                perpage: args[1]
            };
        default:
            return { };
        }
    },
    'FACET': function (tree) {
        return {
            facet: [ {
                type: tree[1],
                label: linktypes[tree[1]].facetlabel,
                value: tree[2].flat,
                link: encodeURIComponent(tree[1] + '[' + tree[2].flat + ']')
                } ]
        };
    },
    'ATOM': function (tree) {
        return tree.slice(1).join(' ');
    },
    'PHRASE': function (tree) {
        return '"' + tree[1] + '"';
    }
};

var canonicalizers = {
    'AND': function (tree) {
        return '(' + 
            (tree[1].canonical.length > 0 ? tree[1].canonical : '') +
            (tree[1].canonical.length > 0 && tree[2].canonical.length > 0 ? ' && ' : '') +
            (tree[2].canonical.length > 0 ? tree[2].canonical : '') +
            ')';
    },
    'OR': function (tree) {
        return '(' + 
            (tree[1].canonical.length > 0 ? tree[1].canonical : '') +
            (tree[1].canonical.length > 0 && tree[2].canonical.length > 0 ? ' || ' : '') +
            (tree[2].canonical.length > 0 ? tree[2].canonical : '') +
            ')';
    },
    'NOT': function (tree) {
        return '!' + tree[1].canonical;
    },
    'FLOAT': function (tree) {
        return '{{' + tree[1].canonical + '}} ' + tree[2].canonical;
    },
    'HAS': function (tree) {
        return tree[1] + ':' + tree[2].canonical;
    },
    'FACET': function (tree) {
        return tree[1] + '[' + tree[2].canonical + ']';
    },
    'FILTER': function (tree) {
        return tree[1] + '<' + tree[2].canonical + '>';
    },
    'ATOM': function (tree) {
        return tree.slice(1).join(' ');
    },
    'PHRASE': function (tree) {
        return '"' + tree[1] + '"';
    }
};

function decompose(tree) {
    var newtree = [ tree[0] ];
    switch (tree[0]) {
    case 'AND':
    case 'OR':
    case 'FLOAT':
        newtree[1] = decompose(tree[1]);
        newtree[2] = decompose(tree[2]);
        break;
    case 'NOT':
        newtree[1] = decompose(tree[1]);
        break;
    case 'HAS':
    case 'FACET':
    case 'FILTER':
        newtree[1] = tree[1];
        newtree[2] = decompose(tree[2]);
        break;
    case 'PHRASE':
    case 'ATOM':
        newtree = tree;
        break;
    }
    var result = { canonical: '', flat: '' };
    if (typeof canonicalizers[tree[0]] === 'function') {
        result.canonical = canonicalizers[tree[0]](newtree) || '';
    }
    if (typeof flatteners[tree[0]] === 'function') {
        result.flat = flatteners[tree[0]](newtree);
    }
    return result;
}

