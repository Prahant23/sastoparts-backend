// controllers/orderController.js
const Order = require('../model/orderModel');

const addOrderItems = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const userId = req.user.userId; 

    const order = new Order({ userId, products, totalAmount });
    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId', 'name price');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addOrderItems,
  getOrderById
};
