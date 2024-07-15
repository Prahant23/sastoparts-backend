const express = require('express');
const router = express.Router();
const productControllers = require('../controllers/productControllers');
const { authGuardAdmin, authGuard } = require('../middleware/authGuard');

router.post('/createProduct', authGuardAdmin, productControllers.createProduct);
router.get('/getProducts', productControllers.getProducts);
router.get('/getProductByUserId/:userId', authGuard, productControllers.getSingleProduct); // Consider renaming this to avoid confusion
router.get('/get_product/:id', productControllers.getSingleProduct); // Route for fetching a single product
router.put('/update_product/:id', authGuardAdmin, productControllers.updateProduct); // Route for updating a product
router.delete('/products/:id', authGuardAdmin, productControllers.deleteProduct); // Route for deleting a product

module.exports = router;
