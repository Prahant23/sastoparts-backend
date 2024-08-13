const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

// Define routes
router.post('/createShippingAddress', shippingController.createShippingAddress);
router.get('/getShippingAddressByUserId/:userId', shippingController.getShippingAddressByUserId);
router.put('/updateShippingAddress/:id', shippingController.updateShippingAddress);
router.delete('/deleteShippingAddress/:id', shippingController.deleteShippingAddress);

module.exports = router;
