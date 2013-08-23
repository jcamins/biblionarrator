"use strict";
var passport = require('passport'),
    BrowserIDStrategy = require('passport-browserid').Strategy,
    models = require('../models'),
    User = models.User,
    config = require('../config/auth');

module.exports.initialize = function (app) {
    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        var user = User.findOne({ email: email });
        done(null, user);
    });

    passport.use(new BrowserIDStrategy({
            audience: config.audience
        },
        function(email, done) {
            var user = User.findOne({ email: email });
            var err;
            if (typeof user === 'undefined') {
                err = 'No such user';
            }
            return done(err, user);
        }
    ));

    app.use(passport.initialize());
    app.use(passport.session());

    return checkAuth;
};

module.exports.passport = passport;

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/auth/login');
}

