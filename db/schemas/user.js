var Schema = require('mongoose').Schema,
    bcrypt = require('bcrypt'),
    _ = require('lodash')

    userSchema = new Schema({
      id: { type: String, unique: true },
      name: String,
      email: { type: String, unique: true },
      password: String,
      followingIds: { type: [String], default: [] }
    })

userSchema.pre('save', function(next) {
  var _this = this
  bcrypt.hash(this.password, 10, function(err, passwordHash) {
    if (err) {
      return next(err)
    }
    _this.password = passwordHash
    next()
  })
})

userSchema.statics.findByUserId = function(id, done) {
  this.findOne({ id: id }, done)
}

userSchema.statics.listFriends = function(user, done) {
  var index = { id: { $in: user.followingIds } }
  this.find(index, done)
}

userSchema.statics.listFollowers = function(user, done) {
  var index = { followingIds: { $in: [ user.id ] } }
  this.find(index, done)
}

userSchema.methods.toClient = function() {
  var user =  _.pick(this, ['name', 'id'])
  return user
}

userSchema.methods.follow = function(userId, done) {
  var update = { $addToSet: { followingIds: userId } }
  this.model('User').findByIdAndUpdate(this._id, update, done)
}

userSchema.methods.unfollow = function(userId, done) {
  var update = { $pull : { followingIds: userId } }
  this.model('User').findByIdAndUpdate(this._id, update, done)
}

module.exports = userSchema
