const Order = require('../model/ordermodel');

const checkoutOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    console.log(req.user.userId);
    const userId = req.user.userId; 

    const order = new Order({ userId, products, totalAmount });
    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order }); //succes message
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  checkoutOrder,
};
