"use strict";
var models,
    environment = require('../lib/environment'),
    extend = require('extend');
//    GraphModel = require('../lib/graphmodel');

function User(data) {
    extend(this, data);
    return this;
}

User.findOne = function (options) {
    var user = environment.users[options.email];
    user.email = options.email;
    return new User(user);
};

User.model = 'user';

module.exports = User;

User.init = function(ref) {
    models = ref;
};
