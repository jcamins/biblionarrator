var auth = require('../lib/auth'),
    passport = auth.passport;

module.exports.browserid = passport.authenticate('browserid', { failureRedirect: '/auth/login', successRedirect: '/' }),

module.exports.login = function(req, res){
    res.render('login', { user: req.user });
};

module.exports.logout = function(req, res){
    req.logout();
    res.redirect('/');
};

