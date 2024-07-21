const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authGuard } = require('../middleware/authGuard');

router.post('/',  orderController.createOrder);
router.get('/getSingleOrder/:id', orderController.getSingleOrder); 
router.get('/user/:id', orderController.getOrderByUserID); 

module.exports = router;
