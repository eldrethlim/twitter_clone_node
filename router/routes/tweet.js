var  _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    connection = require('../../db'),
    ensureAuthentication = require('../../middleware/ensureAuthentication')

var Tweet = connection.model('Tweet')

var ensureAuthentication = function(req, res, next) {

  if (req.isAuthenticated()) {
    return next()
  }

  return res.sendStatus(403);
}

router.get('/:tweetId', function(req, res) {
  Tweet.findById(req.params.tweetId, function(err, tweet) {
    if (err) {
      return res.sendStatus(500)
    }

    if (!tweet) {
      return res.sendStatus(404)
    }

    return res.send({ tweet: tweet.toClient()})
  })
});

router.post('/', ensureAuthentication, function(req, res) {
  var tweet = req.body.tweet

  tweet.created = Date.now() / 1000 | 0
  tweet.userId = req.user.id

  Tweet.create(tweet, function(err, tweet) {
    if (err) {
      var code = err.code === 11000 ? 409 : 500
      return res.sendStatus(code)
    }

    res.send({ tweet: tweet.toClient() })
  })
});

router.delete('/:tweetId', ensureAuthentication, function(req, res) {

  if (!ObjectId.isValid(req.params.tweetId)) {
    return res.sendStatus(400)
  }

  Tweet.findById(req.params.tweetId, function(err, tweet) {

    if (err) {
      return res.sendStatus(500)
    }

    if (!tweet) {
      return res.sendStatus(404)
    }

    if (tweet.userId !== req.user.id) {
      return res.sendStatus(403)
    }

    Tweet.findByIdAndRemove(tweet._id, function(err) {
      if (err) {
        return res.sendStatus(500)
      }

      res.sendStatus(200)
    })
  })

});

router.get('/', ensureAuthentication, function(req, res) {

  if (req.query.stream === "profile_timeline" && req.query.userId) {

    var query = { userId: req.query.userId}
  } else if (req.query.stream === "home_timeline") {

    var query = { userId: { $in: req.user.followingIds } }
  } else {

    return res.sendStatus(400)
  }

  Tweet.find(query, null, { sort: { created: -1 } }, function(err, tweets) {
    if (err) {
      return res.sendStatus(500)
    }

    var responseTweets = _.map(tweets, function(t) {
      return t.toClient()
    });

    res.send({ tweets: responseTweets })
  })
});

module.exports = router
