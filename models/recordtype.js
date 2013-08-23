"use strict";
var models,
    GraphModel = require('../lib/graphmodel');

function RecordType (data) {

    this.initialize(data);

    return this;
}

RecordType.model = 'recordtype';

module.exports = GraphModel(RecordType);

RecordType.init = function (ref) {
    models = ref;
};

