var Schema = require('mongoose').Schema,
    bcrypt = require('bcrypt')

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

module.exports = userSchema
