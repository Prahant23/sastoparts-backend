// models/Shipping.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shippingSchema = new Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    pickUpDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    specificRequirements: { type: String, default: '' }
}, { timestamps: true });

const Shipping = mongoose.model('Shipping', shippingSchema);
module.exports = Shipping;
