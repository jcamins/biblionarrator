var canonicalqueries = {
    'smith': 'keyword:smith',
    'author:smith': 'author:smith',
    'author:smith title:book': '(author:smith && title:book)',
    'title: book author:smith': '(author:smith && title:book)',
    'whatever title:book': '(keyword:whatever && title:book)',
    'author[smith, james]': 'author[smith, james]',
    '{{author:smith}}' : '{{author:smith}} ',
    '{{author:smith}} stuff': '{{author:smith}} (keyword:stuff)',
    'stuff {{author:smith}}': '{{author:smith}} (keyword:stuff)'
};

var expect = require('chai').expect,
    queryparser = require('../lib/queryparser');

describe('Query parser', function () {
    Object.keys(canonicalqueries).forEach(function (query) {
        it('canonicalizes ' + query + ' properly', function () {
            expect(queryparser.canonicalize(queryparser.parse(query))).to.equal(canonicalqueries[query]);
        });
    });
});
