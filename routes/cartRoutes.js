const router = require('express').Router();
const bodyParser = require("body-parser");
const auth = require("../middleware/authGuard");
const { body } = require('express-validator');
const cartController = require("../controllers/cartController");

// Parse incoming request bodies
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Define the route to add item to cart
router.post(
  '/addtocart',
  auth.authGuard,
  body('productId').isMongoId().withMessage('Invalid productId'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  cartController.addtocart
);

// Route to get cart items
router.get('/', auth.authGuard, cartController.getCartItems);

// DELETE request to delete a cart item by ID
router.delete('/delete/:id', auth.authGuard, cartController.deleteCartItem);

// Route to get cart by user ID
router.get('/:userId', auth.authGuard, cartController.getCartByUserID);

module.exports = router;
