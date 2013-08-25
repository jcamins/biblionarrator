"use strict";
var models,
    GraphModel = require('../lib/graphmodel');

function RecordType (data) {
    this.model = 'recordtype';
    this.initialize(data);
    return this;
}

RecordType.model = 'recordtype';

module.exports = RecordType;

GraphModel.extend(RecordType);

RecordType.init = function (ref) {
    models = ref;
};

