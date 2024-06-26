const Users = require("../model/userModel.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { sendEmail } = require("../middleware/sendEmails.js");
const cloudinary = require("cloudinary");
const User = require("../model/userModel.js");


const create = async (req, res) => {
  console.log(req.body);

  const { firstName, email, password, lastName } = req.body;

  if (!firstName || !email || !password || !lastName) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const existingUser = await Users.findOne({ email: email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = new Users({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password, // Note: This is not secure, use a secure way to store passwords
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide email and password" });
  }

  try {
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (password !== user.password) {
      return res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, email: user.email },
      process.env.JWT_SECRET,
    );

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const forgotPassword = async (req, res) => {
  console.log(req.body);
  try {
    const user = await Users.findOne({ email: req.body.email });
    
    if (!user) {
      return res.json({
        success: false,
        message: "Email not found.",
      });
    }
    const resetPasswordToken = user.getResetPasswordToken();

    await user.save();

    // Assuming you have a configuration variable for the frontend URL
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const resetUrl = `${frontendBaseUrl}/password/reset/${resetPasswordToken}`;

    const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await Users.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    // Set the new password directly without using bcrypt
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Notify the user that the password has been updated
    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getUsers = async (req, res) => {
  try{
    const userId = req.params.id || req.user.id;
    const user = await Users.findById(userId);
    if(!user){
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }res.json({
      success: true,
      message: 'Users fetched successfully.',
      user
    })
  }
  catch(error){
    console.log('error: ', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }  
}
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    console.log(userId, 'this is user id')
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    let avatarUrl = null;
    if (typeof req.body.avatar !== 'string') {
      const { avatar } = req.files;
      console.log(avatar)
      const uploadedAvatar = await cloudinary.uploader.upload(avatar.path, { folder: 'avatars' });
      if (!uploadedAvatar || !uploadedAvatar.secure_url) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload avatar to Cloudinary',
        });
      }
      avatarUrl = uploadedAvatar.secure_url;
    } else {
      avatarUrl = req.body.avatar;
    }
    const updateData = {
      ...req.body,
      avatar:avatarUrl
    }
    console.log('updateData: ', updateData);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {new:true})
    console.log('updatedUser: ', updatedUser);
    res.status(200).json({
      success: true,
      message: 'User profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};




module.exports = {
  create,
  login,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  getUsers
  

};
