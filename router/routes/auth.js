var express = require('express'),
    router = express.Router(),
    passport = require('../../auth')

router.post('/login', function(req, res) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.sendStatus(500);
    }

    if (!user) {
      return res.sendStatus(403);
    }

    req.logIn(user, function(err) {
      if (err) {
        return res.sendStatus(500);
      }

      return res.send({ user: user });
    });
  })(req, res);
});

router.post('/logout', function(req, res) {
  req.logout()
  res.sendStatus(200)
});

module.exports = router
