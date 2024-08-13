// controllers/orderController.js
const Order = require('../model/orderModel');
const cloudinary = require('cloudinary');

// Create a new order
const createOrder = async (req, res) => {
    const { userID, cartItems, totalPayment, paymentMethod } = req.body;

    if (!userID || !cartItems || !totalPayment || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: 'Please fill all the required fields.'
        });
    }

    try {
        const newOrder = new Order({
            userID,
            cartItems,
            totalPayment,
            paymentMethod,
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: 'Your order has been created successfully.',
            data: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get a single order by ID
const getSingleOrder = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Order ID is required!'
        });
    }

    try {
        const singleOrder = await Order.findById(id);
        if (!singleOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            order: singleOrder
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get orders by user ID
const getOrderByUserID = async (req, res) => {
    const id = req.params.id;

    try {
        const orders = await Order.find({ userID: id }).populate({
            path: 'cartItems.cartID',
            select: 'productId quantity',
            populate: {
                path: 'productId',
                select: 'itemName itemPrice itemImage quantity'
            }
        }).exec();

        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            orders
        });
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const listOfOrders = await Order.find().populate({
            path: 'cartItems.cartID',
            model: 'CartItem',
            select: 'itemID totalPrice cartQuantity',
            populate: {
                path: 'itemID',
                model: 'Item',
                select: 'itemName itemPrice itemImage quantity owner'
            }
        }).populate({
            path: 'shippingID',
            model: 'ShippingInfo',
            select: 'firstName lastName contactNumber address specificRequirements pickUpDate returnDate'
        }).exec();

        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            orders: listOfOrders,
            count: listOfOrders.length
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Update the status of an order
const updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Update the return status of an order
const updateReturnStatus = async (req, res) => {
    const orderId = req.params.id;
    const { returnStatus } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.returnStatus = returnStatus;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Return status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error updating return status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Cancel an order
const cancelOrder = async (req, res) => {
    const id = req.params.id;

    try {
        const canceledOrder = await Order.findByIdAndDelete(id);
        if (!canceledOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order canceled successfully',
            data: canceledOrder
        });
    } catch (error) {
        console.error('Error canceling order:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getSingleOrder,
    getOrderByUserID,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    updateReturnStatus
};
