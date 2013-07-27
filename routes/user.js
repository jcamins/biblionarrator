var passport = require('passport'),
    datastore = require('../lib/datastore'),
    LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    datastore.query('SELECT * FROM users WHERE id = ?', [id], function(err, results, fields) {
        return done(err, results[0]);
    });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(
    new LocalStrategy(
        function(username, password, done) {
            datastore.query('SELECT * FROM users WHERE email = ?', [username], function(err, results, fields) {
                if (err) {
                    return done(null, false, {
                        message: 'Unknown user ' + username
                    });
                }
                return done(null, results[0]);
            });
        }
    )
);

/* User */
app.post('/user/login', passport.authenticate('local', {
    failureRedirect: '/user/login',
    failureFlash: true
}), function(req, res) {
    req.body.redirect = req.body.redirect || '/';
    console.log('authenticated!');
    res.redirect(req.body.redirect);
});
