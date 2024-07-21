const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authGuard } = require('../middleware/authGuard');

router.post('/',  orderController.createOrder);
router.get('/getSingleOrder/:id', orderController.getSingleOrder); 
router.get('/user/:id', orderController.getOrderByUserID); 
router.put('/updateOrderStatus/:id', orderController.updateOrderStatus);
router.delete('/cancelOrder/:id', orderController.cancelOrder);
router.put('/updateReturnStatus/:id', orderController.updateReturnStatus);

module.exports = router;
    