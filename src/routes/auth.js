var auth = require('../lib/auth'),
    passport = auth.passport;

module.exports.browserid = passport.authenticate('browserid', { failureRedirect: '/auth/login', successRedirect: '/', failureFlash: true });
module.exports.dologin = passport.authenticate('local', { failureRedirect: '/auth/login', successRedirect: '/', failureFlash: true  });

/*jshint -W030 */ /* No idea */
module.exports.login = function(req, res){
    res.render('login');
};
/*jshint +W030 */

module.exports.logout = function(req, res){
    req.logout();
    res.redirect('/');
};

