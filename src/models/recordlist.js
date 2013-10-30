"use strict";
var models,
    extend = require('extend');

module.exports = RecordList;

function RecordList(data) {
    var self = this;
    data.records = data.records || [];
    data.offset = data.offset || 0;
    data.records.forEach(function (one, index) {
        if (one.constructor !== models.Record) {
            one = new models.Record(one);
        }
        one.number = data.offset + index + 1;
        if (typeof one.rendered === 'undefined') {
            one.rendered = one.render();
        }
    });
    extend(self, data);
    return self;
}

RecordList.init = function(ref) {
    models = ref;
};
