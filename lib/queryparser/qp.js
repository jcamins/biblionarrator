var util = require('./util'),
    config = require('../../config/searchengine');

var grammar = util.loadjisongrammar('qp');

grammar.lex.rules = [
    [ '["][^"]*["]', "return 'PHR';" ],
    [ '[^\\s()!:|&]+',   "return 'WORD';" ],
    [ "$",        "return 'EOF';" ],
];

for (var op in config.operators) {
    grammar.lex.rules.unshift([ config.operators[op], "return '" + op + "';" ]);
}

grammar.lex.rules.unshift([ '(' + config.indexes.join('|') + ')\\:', "return 'INDEX';" ]);
grammar.lex.rules.unshift([ '\\s+', '/* skip whitespace */' ]);

console.log(grammar);
var parser = util.getjisonparser(grammar);

module.exports.parse = function (query) {
    return parser.parse(query);
}
module.exports.canonicalize = canonicalize;

function canonicalize(tree) {
    var infix = ' ';
    var branches = [ ];
    var prefix = '';
    var suffix = '';
    switch (tree[0]) {
    case 'AND':
        prefix = '(';
        suffix = ')';
        infix = ' && ';
        branches = [ canonicalize(tree[1]), canonicalize(tree[2]) ];
        break;
    case 'OR':
        prefix = '(';
        suffix = ')';
        infix = ' || ';
        branches = [ canonicalize(tree[1]), canonicalize(tree[2]) ];
        break;
    case 'NOT':
        prefix = '!';
        branches = [ canonicalize(tree[1]) ];
        break;
    case 'HAS':
        branches = [ tree[1] + ':' + canonicalize(tree[2]) ];
        break;
    case 'PHRASE':
        prefix = suffix = '"';
        branches = [ tree[1] ];
        break;
    case 'ATOM':
        return tree.slice(1).join(' ');
    default:
        branches = tree;
    }

    return (prefix + branches.sort().join(infix) + suffix);
}

