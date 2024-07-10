// controllers/bookingController.js
const Booking = require('../model/bookingmodel');

exports.createBooking = async (req, res) => {
    try {
        const { fullName, carNumber, problemDescription, date, contactNumber } = req.body;
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

exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

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
