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

module.exports.parse = function parse(query) {
    parser.yy = { };
    return parser.parse(query);
}
