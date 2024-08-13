// models/orderModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    cartItems: [{
        cartID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CartItem',
            required: true,
        }
    }],
    // Optional: Add the shippingID field if needed
    // shippingID: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'ShippingInfo',
    //     required: true,
    // },
    totalPayment: {
        type: Number,
        required: true,
        default: 0,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'pending',
    },
    returnStatus: {
        type: String,
        required: true,
        default: 'Not Returned',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
