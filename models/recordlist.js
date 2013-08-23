"use strict";
var models;

module.exports = RecordList;

function RecordList(data) {
    data.records = data.records || [];
    data.offset = data.offset || 0;
    data.records.forEach(function (one, index) {
        one.number = data.offset + index + 1;
        one.rendered = one.render();
    });
    var parts;
    var linktype;
    for (var prop in data) {
        if (data.hasOwnProperty(prop) && typeof data[prop] !== 'function') {
            this[prop] = data[prop];
        }
    }

    return this;
}

RecordList.init = function(ref) {
    models = ref;
};
