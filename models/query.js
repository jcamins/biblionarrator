var models,
    queryparser = require('../lib/queryparser');

function Query(string, syntax) {
    var self = this;

    self.original = string;
    self.syntax = syntax;
    self.ast = queryparser[syntax].parse(string);
    self.canonical = queryparser.canonicalize(self.ast);

    return self;
};

module.exports = Query;

Query.init = function(ref) {
    models = ref;
};
