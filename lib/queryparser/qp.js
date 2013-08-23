var util = require('./util'),
    config = require('../../config/searchengine'),
    inspect = require('eyes').inspector({maxLength: false});

var grammar = util.loadjisongrammar('qp');

grammar.lex.rules = [
    [ '["][^"]*["]', "return 'PHR';" ],
    [ '[^{}\\[\\]\\s()!:|&]+',   "return 'WORD';" ],
    [ "$",        "return 'EOF';" ],
];

for (var op in config.operators) {
    if (op !== 'FACET_START') {
        grammar.lex.rules.unshift([ config.operators[op], "return '" + op + "';" ]);
    }
}

grammar.lex.rules.unshift([ '(' + Object.keys(config.indexes).join('|') + ')\\:', "return 'INDEX';" ]);
grammar.lex.rules.unshift([ '(' + Object.keys(config.indexes).join('|') + ')' + config.operators.FACET_START, "return 'FACET_START';" ]);
grammar.lex.rules.unshift([ '\\s+', '/* skip whitespace */' ]);

var parser = util.getjisonparser(grammar);

module.exports.parse = function (query) {
    delete parser.yy.curindex;
    delete parser.yy.indexStack;
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
        if (tree[1].length > 0) {
            branches.push(canonicalize(tree[1]));
        }
        if (tree[2].length > 0) {
            branches.push(canonicalize(tree[2]));
        }
        break;
    case 'OR':
        prefix = '(';
        suffix = ')';
        infix = ' || ';
        if (tree[1].length > 0) {
            branches.push(canonicalize(tree[1]));
        }
        if (tree[2].length > 0) {
            branches.push(canonicalize(tree[2]));
        }
        break;
    case 'NOT':
        prefix = '!';
        branches = [ canonicalize(tree[1]) ];
        break;
    case 'HAS':
        branches = [ tree[1] + ':' + canonicalize(tree[2]) ];
        break;
    case 'FACET':
        branches = [ tree[1] + '[' + canonicalize(tree[2]) + ']' ];
        break;
    case 'PHRASE':
        prefix = suffix = '"';
        branches = [ tree[1] ];
        break;
    case 'ATOM':
        return tree.slice(1).join(' ');
    case 'FLOAT':
        return '{{' + canonicalize(tree[1]) + '}} ' + canonicalize(tree[2]);
    default:
        branches = tree;
    }

    return (prefix + branches.sort().join(infix) + suffix);
}

