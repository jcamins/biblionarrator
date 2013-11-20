"use strict";
var dependencies = {
    environment: require('../lib/environment'),
    GraphModel: require('../lib/graphmodel'),
    formatters: require('../lib/formats')
};
exports.Field = require('./field');
exports.Media = require('./media');
exports.Query = require('./query');
exports.Record = require('./record');
exports.RecordList = require('./recordlist');
exports.RecordType = require('./recordtype');
exports.User = require('./user');
exports.Template = require('./template');

exports.Field.init(exports);
exports.Media.init(exports);
exports.Query.init(exports);
exports.Record.init(exports, dependencies);
exports.RecordList.init(exports);
exports.RecordType.init(exports);
exports.User.init(exports);
exports.Template.init(exports);
