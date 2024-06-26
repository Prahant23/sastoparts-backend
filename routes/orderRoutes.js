const router = require('express').Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authGuard');

// Route to checkout order
router.post('/checkout', auth.authGuard, orderController.checkoutOrder); //checkout route

module.exports = router;
