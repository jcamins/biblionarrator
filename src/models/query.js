"use strict";
var models,
    queryparser = require('../lib/environment').queryparser,
    extend = require('extend');

function Query(string, syntax) {
    var self = this;

    if (string) {
        self.ast = queryparser.parse(syntax, string);
        self.original = string;
        self.syntax = syntax;
        extend(self, queryparser.decompose(self.ast));
    }
    return self;
}

module.exports = Query;

Query.init = function(ref) {
    models = ref;
};
