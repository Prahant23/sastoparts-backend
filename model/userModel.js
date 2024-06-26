// models/User.js
const mongoose = require('mongoose');
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  avatar: {type: String},
  // product:[
  //   {
  //     type:moongose.Schema.Types.ObjectId,
  //     ref:'Product'
  //   }
  // ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
 
});

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto //reset password token
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
