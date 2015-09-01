var express = require('express'),
    router = express.Router(),
    connection = require('../../db'),
    ensureAuthentication = require('../../middleware/ensureAuthentication')

var User = connection.model('User')

router.post('/', function(req, res) {
  var user = req.body.user

  User.create(user, function(err, user) {
    if (err) {
      var code = err.code === 11000 ? 409 : 500
      return res.sendStatus(code)
    }

    req.logIn(user, function(err) {
      if (err) {
        return res.sendStatus(500);
      }

      return res.sendStatus(200);
    });
  });
});

router.get('/:userId', function(req, res) {
  User.findOne({ id: req.params.userId }, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }

    if (!user) {
      return res.sendStatus(404)
    }

    return res.send({ user: user });
  })
});

router.put('/:userId', ensureAuthentication, function(req, res) {

  if (req.user.id !== req.params.userId) {
    return res.sendStatus(403)
  }

  User.findOneAndUpdate({ id: req.user.id}, { password: req.body.password }, function(err, user) {

    if (err) {
      return res.sendStatus(500)
    }

    return res.send(200)
  })
});

module.exports = router
