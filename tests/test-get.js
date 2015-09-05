process.env.NODE_ENV = 'test'

var request = require('supertest'),
    app = require('../index')

describe("GET /api/tweets/:tweetId", function() {

  it('expects 404 for retrieving a tweet that does not exists', function(done) {
    request(app)
      .get('/api/tweets/55231d90f4d19b49441c9cb9')
      .expect(404, done)
  })
})
