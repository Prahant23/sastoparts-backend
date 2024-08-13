const Shipping = require('../model/shippingmodel'); // Ensure correct path and filename

// Create a new shipping address
exports.createShippingAddress = async (req, res) => {
    try {
        const shipping = new Shipping({
            userID: req.body.userID,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address: req.body.address,
            contactNumber: req.body.contactNumber,
            pickUpDate: req.body.pickUpDate,
            returnDate: req.body.returnDate,
            specificRequirements: req.body.specificRequirements,
        });

        const savedShipping = await shipping.save();
        res.status(201).json({ success: true, data: savedShipping, message: "Shipping address created successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get shipping address by user ID
exports.getShippingAddressByUserId = async (req, res) => {
    try {
        const shipping = await Shipping.findOne({ userID: req.params.userId });
        if (!shipping) return res.status(404).json({ success: false, message: 'Shipping address not found' });
        res.status(200).json({ success: true, data: shipping });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update a shipping address
exports.updateShippingAddress = async (req, res) => {
    try {
        const shipping = await Shipping.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!shipping) return res.status(404).json({ success: false, message: 'Shipping address not found' });
        res.status(200).json({ success: true, data: shipping });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete a shipping address
exports.deleteShippingAddress = async (req, res) => {
    try {
        const shipping = await Shipping.findByIdAndDelete(req.params.id);
        if (!shipping) return res.status(404).json({ success: false, message: 'Shipping address not found' });
        res.status(200).json({ success: true, message: 'Shipping address deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
