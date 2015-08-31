var mongoose = require('mongoose'),
    config = require('../config'),
    User = require('./schemas/user.js'),
    Tweet = require('./schemas/tweet.js')

var connection = mongoose.createConnection(config.get('database:host'), config.get('database:name'), config.get('database:port'))

connection.model('User', User)
connection.model('Tweet', Tweet)

module.exports = connection
