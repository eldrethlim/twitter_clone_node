process.env.NODE_ENV = 'test'

var request = require('supertest'),
    mongoose = require('mongoose'),
    config = require('../config'),
    expect = require('chai').expect,
    async = require('async')

describe("POST /api/tweets", function() {

  var app = require('../index'),
      Session = require('supertest-session')({ app: app }),
      agent = new Session()

  before(function(done) {

    function dropDatabase(next) {
      var connection = mongoose.createConnection(
        config.get('database:host'),
        config.get('database:name'),
        config.get('database:port'),
        function(err) {
          if (err) {
            return next(err)
          }
          connection.db.dropDatabase(next)
        }
      )
    }

    function initAgent(next) {
      var userParams = {
        user: {
          id: 'test',
          name: 'Test',
          password: 'test',
          email: 'test@test.com'
        }
      }

      agent
        .post('/api/users')
        .send(userParams)
        .expect(200, next)
    }

    async.series([dropDatabase, initAgent], done)
  })

  it("returns 403 if unauthenticated user posts a tweet", function(done) {
    var tweetParams = {
      tweet: {
        text: "Test tweet",
        userId: "test"
      }
    }

    request(app)
      .post('/api/tweets')
      .send(tweetParams)
      .expect(403, done)
  })

  it("returns 200 if authenticated user posts a tweet", function(done) {

    var tweetParams = {
      tweet: {
        text: "test"
      }
    }

    agent
      .post('/api/tweets')
      .send(tweetParams)
      .expect(200)
      .end(function(err,response) {
        if (err) {
          return done(err)
        }

        try {
          expect(response.body).to.have.property('tweet')
          done(null)
        } catch(err) {
          done(err)
        }
      })
  })
})
