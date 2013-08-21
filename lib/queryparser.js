var fs = require('fs'),
    jison = require('jison'),
    ebnfParser = require('ebnf-parser');
    inspect = require('eyes').inspector({maxLength: false});

var operators = {
    'AND': '&&',
    'OR': '\\|\\|',
    'FS': '{{',
    'FE': '}}',
    'GS': '\\(',
    'GE': '\\)',
    'REQ': '\\+',
    'DIS': '-',
    'MOD': '#',
    'NOT': '!',
};

var indexes = [
    'keyword',
    'author',
    'title',
    'date'
];

var grammar = fs.readFileSync(__dirname + '/queryparser/qp.jison', { encoding: 'utf8' });
grammar = ebnfParser.parse(grammar);

grammar.lex.rules = [
    [ '["][^"]*["]', "return 'PHR';" ],
    [ '[^\\s()!:|&]+',   "return 'WORD';" ],
    [ "$",        "return 'EOF';" ],
];

for (var op in operators) {
    grammar.lex.rules.unshift([ operators[op], "return '" + op + "';" ]);
}

grammar.lex.rules.unshift([ '(' + indexes.join('|') + ')\\:', "return 'INDEX';" ]);
grammar.lex.rules.unshift([ '\\s+', '/* skip whitespace */' ]);

var parser = new jison.Parser(grammar);

var mytree = parser.parse('keyword author:smith, john && (title: book || thing) && "this is a thing"');

console.log(canonicalize(mytree));

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
