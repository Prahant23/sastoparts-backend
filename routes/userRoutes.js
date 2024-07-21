// userRoutes.js
const router = require('express').Router();
const userController = require('../controllers/userControllers');
const {updateUserProfile} = require("../controllers/userControllers")
const { authGuard } = require('../middleware/authGuard');

// Edit profile route

router.route('/getUsers/:id').get(userController.getUsers);
router.route('/updateUser/:id').put(userController.updateUser);
router.post('/create', userController.create);
router.post('/login', userController.login);
router.route("/forgot/password").post(userController.forgotPassword);
router.route("/password/reset/:token").put(userController.resetPassword); 
router.put('/changePassword/:userId', userController.changePassword);


 //password route

module.exports = router;
