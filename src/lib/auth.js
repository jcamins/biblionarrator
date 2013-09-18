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
                User.findOne(email, function (err, user) {
                    if (err) {
                        done(err, null);
                    } else if (!user) {
                        done(null, false, { message: 'BADCREDENTIAL' });
                    } else {
                        done(null, user);
                    }
                });
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
};

module.exports.passport = passport;

module.exports.can = can;

var permissions = {
    'view_field': 'view fields',
    'edit_field': 'edit fields',
    'view_record': 'view records',
    'edit_record': 'edit records',
};

var acls = { };

function can(action, object) {
    var key = action + '_' + object;
    if (typeof acls[key] !== 'function') {
        acls[key] = function (req, res, next) {
            if (typeof req.user !== 'undefined' && typeof req.user.permissions !== 'undefined' && (req.user.permissions === '*' || req.user.permissions[key])) {
                next();
            } else {
                req.flash('error', 'NOTPERMITTED:' + key);
                req.flash('redirect', req.url);
                res.redirect('/auth/login');
            }
        };
    }
    return acls[key];
}

module.exports.browseridauth = passport.authenticate('browserid', { failureRedirect: '/auth/login', failureFlash: 'BADCREDENTIAL:browserid' });
module.exports.localauth = passport.authenticate('local', { failureRedirect: '/auth/login', failureFlash: 'BADCREDENTIAL:local'  });
module.exports.logout = function(req, res){
    req.logout();
    res.redirect('/');
};

module.exports.redirect = function(req, res) {
    res.redirect(req.body.redirect || '/');
};

module.exports.loginform = function login(req, res) {
    var messages = { };
    var redirect = req.flash('redirect');
    if (redirect.length > 0) {
        messages.redirect = redirect;
        req.flash('redirect', redirect);
    }
    var error = req.flash('error');
    if (error.length > 0) {
        error = error[0].split(':');
        switch (error[0]) {
        case 'BADCREDENTIAL':
            switch (error[1]) {
            case 'browserid':
                messages.error = 'Unable to authenticate using BrowserID';
                break;
            case 'local':
                messages.error = 'Username or password not recognized';
            }
            break;
        case 'NOTPERMITTED':
            messages.error = 'You do not have permission to ' + permissions[error[1]];
        }
    }
    res.render('login', messages);
}
