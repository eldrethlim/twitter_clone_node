var _ = require('lodash'),
    shortId = require('shortid'),
    express = require('express'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    fixtures = require('./fixtures'),
    passport = require('./auth'),
    config = require('./config'),
    connection = require('./db'),
    app = express();

// Models
var User = connection.model('User'),
    Tweet = connection.model('Tweet')

app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

var ensureAuthenticated = function(req, res, next) {

  if (req.isAuthenticated()) {
      return next()
  }

  return res.sendStatus(403);
}

var ensureAuthorized = function(req, res, next) {
  var tweet = _.find(fixtures.tweets, { id: req.params.tweetId });

  if (req.isAuthenticated() && req.user.id === tweet.userId) {
    return next()
  }

  return res.sendStatus(403);
}

// User Routes

app.post('/api/auth/login', function(req, res) {
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

app.post('/api/auth/logout', function(req, res) {
  req.logout()
  res.sendStatus(200)
})

app.post('/api/users', function(req, res) {
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

app.get('/api/users/:userId', function(req, res) {
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

app.put('/api/users/:userId', ensureAuthenticated, function(req, res) {

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

// Tweet Routes

app.get('/api/tweets/:tweetId', function(req, res) {
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

app.post('/api/tweets', ensureAuthenticated, function(req, res) {
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

app.delete('/api/tweets/:tweetId', ensureAuthorized, function(req, res) {
  var removedTweets = _.remove(fixtures.tweets, 'id', req.params.tweetId)

  if (removedTweets.length == 0) {
    return res.sendStatus(404)
  }

  return res.sendStatus(200)
});

app.get('/api/tweets', function(req, res) {
  if (!req.query.userId) {
    return res.sendStatus(400)
  }

  var tweets = _.where(fixtures.tweets, { userId: req.query.userId });
  var sortedTweets = tweets.sort(function(a,b) { return b.created - a.created });

  return res.send({ tweets: sortedTweets });
});

var server = app.listen(config.get('server:port'), config.get('server:host'));

module.exports = server;
