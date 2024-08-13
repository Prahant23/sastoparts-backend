// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
    },
    carNumber: {
        type: String,
        required: [true, 'Car number is required'],
    },
    problemDescription: {
        type: String,
        required: [true, 'Problem description is required'],
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create the model from the schema
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
