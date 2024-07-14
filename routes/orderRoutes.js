// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById } = require('../controllers/orderController');
const { authGuard } = require('../middleware/authGuard');

// POST request to create a new order
router.post('/', authGuard, addOrderItems);

// GET request to fetch order details by ID
router.get('/:id', authGuard, getOrderById);

module.exports = router;
