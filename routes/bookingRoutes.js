// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/', bookingController.createBooking);

// Get all bookings
router.get('/', bookingController.getBookings);

// Get a single booking by ID
router.get('/:id', bookingController.getBooking);

// Get bookings by user ID
router.get('/user/:userId', bookingController.getBookingsByUser);

// Update a booking by ID
router.put('/:id', bookingController.updateBooking);

// Delete a booking by ID
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
