// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.get('/user/:userId', bookingController.getBookingsByUser);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);


module.exports = router;
