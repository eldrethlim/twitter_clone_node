var Schema = require('mongoose').Schema,
    _ = require('lodash')

    tweetSchema = new Schema({
      userId: String,
      created: Number,
      text: String
    })

tweetSchema.methods.toClient = function() {
  var tweet = _.pick(this, ['userId', 'created', 'text'])
  tweet.id = this._id

  return tweet
}

module.exports = tweetSchema
