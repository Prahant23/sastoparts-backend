const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: Number, required: false },
  address: { type: String, required: false },
  isAdmin: { type: Boolean, default: false },
  avatar: { type: String }, 
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockoutExpires: { type: Date, default: null },
  passwordHistory: [{ passwordHash: String, changedAt: Date }] // Password history to prevent reuse
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 12;

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    console.log('Password is being hashed and saved.');

    const hasUpperCase = /[A-Z]/.test(this.password);
    const hasLowerCase = /[a-z]/.test(this.password);
    const hasNumber = /\d/.test(this.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new Error('Password must include uppercase, lowercase, numbers, and special characters.');
    }

    const passwordHash = await bcrypt.hash(this.password, 10);
    
    // Use asynchronous comparison
    for (const history of this.passwordHistory) {
      const isReused = await bcrypt.compare(this.password, history.passwordHash);
      if (isReused) {
        throw new Error('New password cannot be one of your recent passwords.');
      }
    }

    this.passwordHistory.unshift({ passwordHash, changedAt: new Date() });
    this.passwordHistory = this.passwordHistory.slice(0, 5);

    this.password = passwordHash;

    console.log('Password hashed and saved successfully.');
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.getVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

  return verificationToken;
};

const Users = mongoose.model('Users', userSchema);
module.exports = Users;
