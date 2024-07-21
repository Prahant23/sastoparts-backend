const Order = require("../model/orderModel");
const cloudinary = require("cloudinary");
const createOrder = async (req, res) => {
  const { userID, cartItems, shippingID, totalPayment, paymentMethod } = req.body;
  console.log(req.body)

  if (!userID || !cartItems ||  !totalPayment || !paymentMethod) {
      return res.json({
          success: false,
          message: "Please fill all the fields"
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

      res.status(200).json({
          success: true,
          message: "Your order has been created.",
          data: newOrder
      });
  } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
          success: false,
          message: "Server Error"
      });
  }
};

const getSingleOrder = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.json({
            success: false,
            message: "Order id is required!"
        })
    }
    try {
        const singleOrder = await Order.findById(id);
        res.json({
            success: true,
            message: "Order fetched successfully",
            order: singleOrder
        })

    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")

    }
}

const getOrderByUserID = async (req, res) => {
    const id = req.params.id;
    try {
        const orders = await Order.find({ userID: id }).populate({
            path: 'cartItems.cartID',  // Populate CartItem
            select: 'productId quantity',
            populate: {
                path: 'productId',  // Populate Product within CartItem
                select: 'itemName itemPrice itemImage quantity'
            }
        }).exec();

        res.json({
            message: "Orders retrieved",
            success: true,
            orders: orders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving orders",
            success: false,
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const listOfOrders = await Order.find().populate({
            path: 'cartItems.cartID',
            model: 'Cart',
            select: 'itemID  totalPrice cartQuantity',
            populate: {
                path: 'itemID',
                model: 'Item',
                select: 'itemName itemPrice itemImage quantity owner'
            }
        }).populate({
            path: 'shippingID',
            model: 'ShippingInfo',
            select: 'firstName lastName contactNumber address specificRequirements pickUpDate ReturnDate'
        })
        .exec();

        res.json({
            success: true,
            message: "Orders fetched successfully",
            orders: listOfOrders,
            count: listOfOrders.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};



// OrderController.js
// const updateOrderStatus = async (req, res) => {
//     try {
//         const { status } = req.body;
//         const { id } = req.params;
//         const validStatuses = ['approved', 'unavailable', 'pending'];

//         if (!validStatuses.includes(status)) {
//             return res.status(400).json({ success: false, message: 'Invalid status' });
//         }

//         const order = await Order.findById(id);
//         if (!order) {
//             return res.status(404).json({ success: false, message: 'Order not found' });
//         }

//         order.orderStatus = status;
//         await order.save();

//         res.json({ success: true, message: 'Order status updated successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Server Error' });
//     }
// };

// Route


const cancelOrder = async (req, res) => {
    const id = req.params.id;
    try {
        const canceledOrder = await Order.findByIdAndDelete(id);
        if (!canceledOrder) {
            return res.json({
                success: false,
                message: "Order not found",
            });
        }

        res.json({
            success: true,
            message: "Order canceled successfully",
            data: canceledOrder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const updateReturnStatus = async (req, res) => {
    try {
      const orderId = req.params.id;
      const { returnStatus } = req.body;
  
      console.log(orderId);
      console.log(returnStatus);
  
      // Check if the bluebook with the given ID exists
      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
  
      // Update the bluebook status
     order.returnStatus = returnStatus;
      await order.save();
  
      return res.json({
        success: true,
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Error updating return status:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body; // Adjust if you are using `returnStatus` instead

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update the order status
        order.orderStatus = status;
        await order.save();

        return res.json({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    createOrder,
    getSingleOrder,
    getOrderByUserID,
    getAllOrders,
    updateOrderStatus,
    cancelOrder, updateReturnStatus
};