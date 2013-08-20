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
    'SEP': ':'
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

grammar.lex.rules.unshift([ '(' + indexes.join('|') + ')', "return 'INDEX';" ]);
grammar.lex.rules.unshift([ '\\s+', '/* skip whitespace */' ]);

var parser = new jison.Parser(grammar);

var mytree = parser.parse('author:smith, john && (title: book || thing) && "this is a thing"');

console.log(canonicalize(mytree));

function canonicalize(tree) {
    switch (tree[0]) {
    case 'AND':
        return '(' + canonicalize(tree[1]) + ' && ' + canonicalize(tree[2]) + ')';
    case 'OR':
        return '(' + canonicalize(tree[1]) + ' || ' + canonicalize(tree[2]) + ')';
    case 'NOT':
        return '!' + canonicalize(tree[1]);
    case 'HAS':
        return tree[1] + ':' + canonicalize(tree[2]);
    case 'PHRASE':
        return '"' + tree[1] + '"';
    default:
        return tree.join(' ');
    }
}
