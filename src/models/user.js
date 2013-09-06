"use strict";
var models,
    config = require('../../config/auth'),
    extend = require('extend');
//    GraphModel = require('../lib/graphmodel');

function User(data) {
    extend(this, data);
    return this;
}

User.findOne = function (options) {
    var user = config.users[options.email];
    user.email = options.email;
    return new User(user);
};

User.model = 'user';

module.exports = User;

User.init = function(ref) {
    models = ref;
};
