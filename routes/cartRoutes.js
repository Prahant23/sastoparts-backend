const router = require('express').Router();
const bodyParser = require("body-parser");
const auth = require("../middleware/authGuard");
const cartController=require("../controllers/cartController")

// Parse incoming request bodies
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Define the route to add item to cart
router.route('/addtocart').post(auth.authGuard, cartController.addtocart); //addtocart
router.route('/').get(auth.authGuard, cartController.getCartItems); //route
// DELETE request to delete a cart item by ID
router.delete('/delete/:id', cartController.deleteCartItem);//delete routes for cart
router.get('/:id',cartController.getCartByUserID);




module.exports = router;