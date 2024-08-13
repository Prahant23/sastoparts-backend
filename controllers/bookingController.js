// controllers/bookingController.js
const Booking = require('../model/bookingmodel');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { fullName, carNumber, problemDescription, date, contactNumber } = req.body;
        if (!fullName || !carNumber || !problemDescription || !date || !contactNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newBooking = new Booking({
            fullName,
            carNumber,
            problemDescription,
            date,
            contactNumber,
        });
        await newBooking.save();
        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all bookings
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get a single booking by ID
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get bookings by user ID
exports.getBookingsByUser = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const { fullName, carNumber, problemDescription, date, contactNumber } = req.body;
        const booking = await Booking.findByIdAndUpdate(req.params.id, {
            fullName,
            carNumber,
            problemDescription,
            date,
            contactNumber,
        }, { new: true });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking updated successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
