"use strict";
var models,
    GraphModel = require('../lib/graphmodel');

function User(data) {
    this.model = 'user';
    this.initialize(data);
    return this;
}

User.model = 'user';

module.exports = User;

GraphModel.extend(User);

User.init = function(ref) {
    models = ref;
};
