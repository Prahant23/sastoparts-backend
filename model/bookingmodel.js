// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    carNumber: {
        type: String,
        required: true,
    },
    problemDescription: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
