const Users = require("../model/userModel.js");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../middleware/sendEmails.js");

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 12;

const create = async (req, res) => {
  const { firstName, email, password, lastName, contactNumber, address } = req.body;

  if (!firstName || !email || !password || !lastName) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const existingUser = await Users.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = new Users({
      firstName,
      lastName,
      email,
      password,
      contactNumber,
      address
    });

    // Generate verification token
    const verificationToken = newUser.getVerificationToken();
    
    // Save user to trigger pre-save middleware for password validation and hashing
    await newUser.save();

    // Send verification email
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const verifyUrl = `${frontendBaseUrl}/verify-email/${verificationToken}`;
    const message = `Please verify your email by clicking the link below: \n\n ${verifyUrl}`;

    try {
      await sendEmail({ email: newUser.email, subject: "Email Verification", message });
      res.json({ success: true, message: "User created successfully. Please check your email to verify your account." });
    } catch (error) {
      console.error('Error sending verification email:', error);
      res.status(500).json({ success: false, message: "Failed to send verification email." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    console.log("User retrieved:", user);

    // Check if the user is locked out
    if (user.lockoutExpires && user.lockoutExpires > Date.now()) {
      const remainingTimeInSeconds = Math.max(0, Math.ceil((user.lockoutExpires - Date.now()) / 1000));
      const minutes = Math.floor(remainingTimeInSeconds / 60);
      const seconds = remainingTimeInSeconds % 60;
      return res.json({ 
        success: false, 
        message: `Account locked. Try again later in ${minutes} minute(s) and ${seconds} second(s).` 
      });
    }

  
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch");

      // Increment login attempts
      user.loginAttempts += 1;

      // Lockout if too many attempts
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockoutExpires = Date.now() + LOCKOUT_DURATION;
      }

      await user.save();

      const remainingTimeInSeconds = user.lockoutExpires ? Math.max(0, Math.ceil((user.lockoutExpires - Date.now()) / 1000)) : 0;
      const minutes = Math.floor(remainingTimeInSeconds / 60);
      const seconds = remainingTimeInSeconds % 60;
      return res.json({ 
        success: false, 
        message: `Incorrect password. ${remainingTimeInSeconds > 0 ? `Try again later in ${minutes} minute(s) and ${seconds} second(s).` : ''}` 
      });
    }

    console.log("Password matched successfully. Resetting login attempts.");

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockoutExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create session after successful login
    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    req.session.email = user.email;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // Find the user
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if the old password is correct
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
    }

    // Enforce password length and complexity
    if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({ success: false, message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long.` });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ success: false, message: 'Password must include uppercase, lowercase, numbers, and special characters.' });
    }

    // Check password history to prevent reuse
    const isReused = await Promise.all(user.passwordHistory.map(async (history) => 
      await bcrypt.compare(newPassword, history.passwordHash)
    )).then(results => results.some(result => result === true));
    

    if (isReused) {
      return res.status(400).json({ success: false, message: 'New password cannot be one of your recent passwords.' });
    }

    // Hash and save the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password history
    console.log("Old Password: ", oldPassword);
console.log("New Password: ", newPassword);
console.log("Is Match for Old Password: ", isMatch);
console.log("Is Reused: ", isReused);

    user.passwordHistory.unshift({ passwordHash: hashedNewPassword, changedAt: new Date() });
    user.passwordHistory = user.passwordHistory.slice(0, 5); // Store last 5 passwords

    // Update the user's password
    user.password = hashedNewPassword;

    // Save the user
    await user.save();

    console.log("Password hashed and saved successfully.", user.password);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: false, message: "Email not found." });
    }

    const resetPasswordToken = user.getResetPasswordToken();
    await user.save();

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const resetUrl = `${frontendBaseUrl}/reset-password/${resetPasswordToken}`;

    const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({ email: user.email, subject: "Reset Password", message });
      res.status(200).json({ success: true, message: `Email sent to ${user.email}` });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  try {
    const user = await Users.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    // Set the new password
    user.password = req.body.password;

    try {
      // Save the user, triggering the pre-save middleware where the error could occur
      await user.save();
      res.json({ success: true, message: "Password updated successfully." });
    } catch (error) {
      // Handle the specific error related to password reuse
      if (error.message.includes("New password cannot be one of your recent passwords")) {
        return res.status(400).json({ success: false, message: error.message });
      }
      // Handle any other errors
      return res.status(500).json({ success: false, message: "Failed to update password." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const getUsers = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'Users fetched successfully.', user });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateUser = async (req, res) => {
  const { firstName, lastName, email, contactNumber, address, password } = req.body;
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.contactNumber = contactNumber || user.contactNumber;
    user.address = address || user.address;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      user.avatar = req.file.path; 
    }

    const updatedUser = await user.save();
    res.json({ success: true, message: "User updated successfully", updatedUser });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await Users.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


const verifyEmail = async (req, res) => {
  console.log('VerifyEmail API called with token:', req.params.token);
  
  try {
    const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await Users.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log('Token invalid or expired');
      return res.status(400).json({ success: false, message: "Verification token is invalid or has expired" });
    }

    if (user.emailVerified) {
      console.log('Email already verified');
      return res.status(400).json({ success: false, message: "Email is already verified." });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('Email verified successfully');
    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.log('Error occurred:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};






// const changePassword = async (req, res) => {
//   try {
//     const { userId, oldPassword, newPassword } = req.body;

//     // Find the user
//     const user = await Users.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found.' });
//     }

//     // Check if the old password is correct
//     const isMatch = await user.comparePassword(oldPassword);
//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
//     }

//     // Enforce password length and complexity
//     if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
//       return res.status(400).json({ success: false, message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long.` });
//     }

//     const hasUpperCase = /[A-Z]/.test(newPassword);
//     const hasLowerCase = /[a-z]/.test(newPassword);
//     const hasNumber = /\d/.test(newPassword);
//     const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

//     if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
//       return res.status(400).json({ success: false, message: 'Password must include uppercase, lowercase, numbers, and special characters.' });
//     }

//     // Check password history to prevent reuse
//     const isReused = await Promise.any(user.passwordHistory.map(async (history) => 
//       bcrypt.compare(newPassword, history.passwordHash)
//     ));

//     if (isReused) {
//       return res.status(400).json({ success: false, message: 'New password cannot be one of your recent passwords.' });
//     }

//     // Hash and save the new password
//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);

//     // Update password history
//     user.passwordHistory.unshift({ passwordHash: hashedNewPassword, changedAt: new Date() });
//     user.passwordHistory = user.passwordHistory.slice(0, 5); // Store last 5 passwords

//     // Update the user's password
//     user.password = hashedNewPassword;

//     // Save the user
//     await user.save();

//     res.json({ success: true, message: 'Password changed successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message || 'Server error.' });
//   }
// };

const checkPasswordExpiry = (req, res, next) => {
  const user = req.user; // Assuming the user is already authenticated and `req.user` is populated

  // Check if the user's password is expired
  if (user.passwordChangedAt && Date.now() > user.passwordChangedAt.getTime() + user.passwordExpiryDuration) {
    return res.status(401).json({
      success: false,
      message: 'Your password has expired. Please change your password to continue.',
      redirectToChangePassword: true,
    });
  }

  next();
};

const logout = (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).json({ success: false, message: "Failed to log out" });
      }

      res.clearCookie('connect.sid');
      res.json({ success: true, message: "Logged out successfully" });
  });
};

const checkSession = (req, res) => {
  if (req.session.userId) {
    res.json({ success: true, message: 'Session is active' });
  } else {
    res.json({ success: false, message: 'Session expired' });
  }
};




module.exports = {
  create,
  login,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUser,
  deleteUser,
  verifyEmail,
  changePassword,
  checkPasswordExpiry,
  logout,
  checkSession
};
