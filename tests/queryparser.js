var decomposedqueries = {
    'smith': { canonical: 'keyword:smith' },
    'author:smith': { canonical: 'author:smith' },
    'author:smith title:book': { canonical: '(author:smith && title:book)' },
    'title: book author:smith': { canonical: '(title:book && author:smith)' },
    'whatever title:book': { canonical: '(keyword:whatever && title:book)' },
    'author[smith, james]': {
        canonical: 'author[smith, james]',
        facets: [ { type: 'author', label: 'Author', value: 'smith, james', link: 'author%5Bsmith%2C%20james%5D' } ]
    },
    '{{author:smith}}' : { canonical: '{{author:smith}} ' },
    '{{author:smith}} stuff': { canonical: '{{author:smith}} (keyword:stuff)' },
    'stuff {{author:smith}}': { canonical: '{{author:smith}} (keyword:stuff)' },
    'smith range<0 20>': { canonical: '(keyword:smith && range<0 20>)' }
};

var expect = require('chai').expect,
    queryparser = require('../lib/queryparser');

describe('Query parser', function () {
    before(function (done) {
        queryparser.initialize({
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
                }
            }
        });
        done();
    });
    Object.keys(decomposedqueries).forEach(function (query) {
        it('decomposes ' + query + ' properly', function () {
            var decomposed = queryparser.decompose(queryparser.parse(query));
            for (var key in decomposedqueries[query]) {
                expect(decomposed[key]).to.deep.equal(decomposedqueries[query][key]);
            }
        });
    });
});
