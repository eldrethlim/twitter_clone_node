var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    _ = require('lodash'),
    fixtures = require('./fixtures'),
    connection = require('./db'),
    User = connection.model('User')

var verify = function(username, password, done) {
  var user = User.findOne({ id: username }, function(err, user) {

    if (err) {
      return done(err)
    }
    
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' })
    }

    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password' })
    }

    done(null, user)
  })
};

passport.use(new LocalStrategy(verify));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({ id: id }, done)
});

module.exports = passport;
