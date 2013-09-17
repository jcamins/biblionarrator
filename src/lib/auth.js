"use strict";
var passport = require('passport'),
    BrowserIDStrategy = require('passport-browserid').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    models = require('../models'),
    User = models.User,
    environment = require('./environment');

module.exports.initialize = function (app) {
    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        User.findOne(email, done);
    });

    if (environment.domain) {
        passport.use(new BrowserIDStrategy({
                audience: environment.domain
            },
            function(email, done) {
                User.findOne(email, done);
            }
        ));
    }
    passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne(username, function (err, user) {
                if (err) {
                    done(err, null);
                } else if (!user) {
                    done(null, false, { message: 'BADCREDENTIAL' });
                } else {
                    user.authenticate(password, function (success) {
                        if (success) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'BADCREDENTIAL' });
                        }
                    });
                }
            });
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

