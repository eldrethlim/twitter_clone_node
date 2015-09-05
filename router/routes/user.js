var express = require('express'),
    router = express.Router(),
    connection = require('../../db'),
    _ = require('lodash'),
    ensureAuthentication = require('../../middleware/ensureAuthentication')

var User = connection.model('User')

// Create User
router.post('/', function(req, res) {
  var user = req.body.user

  User.create(user, function(err, user) {
    if (err) {
      console.log(err)
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

// Fetch User
router.get('/:userId', function(req, res) {
  User.findOne({ id: req.params.userId }, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }

    if (!user) {
      return res.sendStatus(404)
    }

    return res.send({ user: user.toClient() });
  })
});


// Update User
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

// Get user's followers
router.get('/:userId/followers', ensureAuthentication, function(req, res) {
  var userId = req.params.userId

  User.findByUserId(userId, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }

    if (!user) {
      return res.sendStatus(404)
    }

    User.listFollowers(user, function(err, followers) {

      if (err) {
        return res.sendStatus(500)
      }

      response_followers = _.map(followers, function(f) {
        return f.toClient()
      })

      res.send({ users: response_followers })
    })
  })
});

// Get all user's friends
router.get('/:userId/friends', ensureAuthentication, function(req, res) {
  var userId = req.params.userId

  User.findByUserId(userId, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }

    if (!user) {
      return res.sendStatus(404)
    }

    User.listFriends(user, function(err, friends) {

      if (err) {
        return res.sendStatus(500)
      }

      response_friends = _.map(friends, function(f) {
        return f.toClient();
      })
      res.send({ users: response_friends })
    })
  })
});

// Follow User
router.post('/:userId/follow', ensureAuthentication, function(req, res) {

  var userId = req.params.userId

  User.findByUserId(userId, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }

    if (!user) {
      return res.sendStatus(403)
    }
    req.user.follow(userId, function(err) {
      if (err) {
        return res.sendStatus(500)
      }

      res.sendStatus(200)
    })
  })
});

// Unfollow User
router.post('/:userId/unfollow', ensureAuthentication, function(req, res) {

  var userId = req.params.userId

  User.findByUserId(userId, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }

    if (!user) {
      return res.sendStatus(403)
    }
    req.user.unfollow(userId, function(err) {
      if (err) {
        return res.sendStatus(500)
      }

      return res.sendStatus(200)
    })
  })
});

module.exports = router
