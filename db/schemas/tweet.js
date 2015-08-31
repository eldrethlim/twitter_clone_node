var Schema = require('mongoose').Schema,

    tweetSchema = new Schema({
      userId: String,
      created: Number,
      text: String
    })

module.exports = tweetSchema
