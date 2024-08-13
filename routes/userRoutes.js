const express = require('express');
const multer = require('multer'); // Add multer for handling file uploads

const path = require('path');
const router = express.Router();
const {
  create,
  login,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUser,
  deleteUser,
  verifyEmail,
  changePassword,
  logout,
  checkSession
} = require('../controllers/userControllers');
const { authGuard } = require('../middleware/authGuard');

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../uploads'); // Folder where files will be saved
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Unique filename
    },
  }),
});

// Routes
router.post('/register', create);
router.post('/login', login);
router.get('/users/:id?', getUsers);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/users/:id?', getUsers);
router.put('/update/:id', upload.single('avatar'), updateUser); 
router.put('/updateUser/:id', updateUser);
router.delete('/delete/:id', deleteUser);
router.get('/verify-email/:token', verifyEmail);
router.put('/changepassword', changePassword);
router.post('/logout', logout);
router.get('/check-session', checkSession);


module.exports = router;
