// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authGuard } = require('../middleware/authGuard');

// Create a new order
router.post('/', authGuard, orderController.createOrder);

// Get a single order by ID
router.get('/getSingleOrder/:id', authGuard, orderController.getSingleOrder);

// Get orders by user ID
router.get('/user/:id', authGuard, orderController.getOrderByUserID);

// Update the status of an order
router.put('/updateOrderStatus/:id', authGuard, orderController.updateOrderStatus);

// Cancel an order
router.delete('/cancelOrder/:id', authGuard, orderController.cancelOrder);

// Update the return status of an order
router.put('/updateReturnStatus/:id', authGuard, orderController.updateReturnStatus);

module.exports = router;
