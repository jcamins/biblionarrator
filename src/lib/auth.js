"use strict";
var passport = require('passport'),
    BrowserIDStrategy = require('passport-browserid').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    models = require('../models'),
    User = models.User,
    config = require('../../config/auth');

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
            return done(err, user);
        }
    ));
    passport.use(new LocalStrategy(
        function(username, password, done) {
            var user = User.findOne({ email: username });
            if (!user || user.password !== password) {
                return done(null, false, { message: 'BADCREDENTIAL' });
            }
            return done(null, user);
        }
    ));

    app.use(passport.initialize());
    app.use(passport.session());

    return checkAuth;
};

module.exports.passport = passport;

module.exports.can = checkAuth;

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/auth/login');
}

