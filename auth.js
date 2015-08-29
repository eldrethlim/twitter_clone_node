var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    _ = require('lodash'),
    fixtures = require('./fixtures')

var verify = function(username, password, done) {
  var user = _.find(fixtures.users, { id: username })

  if (!user) {
    return done(null, false, { message: 'Incorrect username.' })
  }
  if (user.password !== password) {

    return done(null, false, { message: 'Incorrect password.' })
  }

  done(null, user)
};

passport.use(new LocalStrategy(verify));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  var user = _.find(fixtures.users, { id: id })

  if (!user) {
    return done(null, false)
  }

  done(null, user)
});

module.exports = passport;
