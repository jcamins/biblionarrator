"use strict";
var extend = require('extend'),
    bcrypt = require('bcrypt'),
    models,
    environment = require('../lib/environment'),
    DataModel = require('../lib/datamodel');

function User(data) {
    var self = this;
    self.model = 'User';
    extend(self, data);

    self.authenticate = function (password, callback) {
        bcrypt.compare(password, self._password, function (err, res) {
            if (res) {
                callback(true, self);
            } else {
                callback(false, null);
            }
        });
    };

    self.setPassword = function (password, callback) {
        bcrypt.hash(password, environment.salt, function (err, hash) {
            self._password = hash;
            callback(self);
        });
    };

    Object.defineProperties(self, {
        "id": {
            "get": function () { return self.name; }
        }
    });

    return self;
}

DataModel.extend(User);

User.findOne = function (email, callback) {
    DataModel.findOne(User, email, function (err, model) {
        var user = environment.users[email] || { };
        if ((err || model === null) && typeof user === 'undefined') {
            callback(err, null);
        }
        user = user || { };
        if (model !== null) {
            extend(true, user, model);
        }
        callback(err, new User(user));
    });
};

User.all = function (callback) {
    DataModel.all(User, function (err, list, map) {
        var users = { };
        Object.keys(environment.users).forEach(function (user) {
            users[user] = environment.users[user];
        });
        Object.keys(map).forEach(function (user) {
            if (map[user] !== null) {
                users[user] = users[user] || new User();
                extend(true, users[user], map[user]);
            }
        });
        if (typeof callback === 'function') {
            callback(err, users);
        }
    });
};

User.model = 'user';

module.exports = User;

User.init = function(ref) {
    models = ref;
};
