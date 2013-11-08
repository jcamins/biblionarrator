"use strict";
var models,
    extend = require('extend');

function Media(data, recordid) {
    var self = this;

    extend(self, data);

    self.recordid = function () {
        return recordid;
    };
}

module.exports = Media;

Media.init = function(ref) {
    models = ref;
};
