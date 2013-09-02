var fs = require('fs'),
    jison = require('jison'),
    ebnfParser = require('ebnf-parser');

module.exports.loadjisongrammar = function (name) {
    var spec = fs.readFileSync(__dirname + '/grammars/' + name + '.jison', { encoding: 'utf8' });
    return ebnfParser.parse(spec);
};

module.exports.getjisonparser = function (grammar) {
    return new jison.Parser(grammar);
};
