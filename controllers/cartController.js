const mongoose = require('mongoose');
const CartItem = require('../model/cartmodel');
const Products = require("../model/productModel");
const { body, validationResult } = require('express-validator');

// Controller to add item to cart
const addtocart = async (req, res) => {
  await body('productId').isMongoId().run(req);
  await body('quantity').isInt({ min: 1 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    // Create a new CartItem instance with userId
    const cartItem = new CartItem({
      productId: new mongoose.Types.ObjectId(productId),
      quantity,
      userId: new mongoose.Types.ObjectId(userId)
    });

    await cartItem.save();
    res.status(201).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCartItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartItems = await CartItem.find({ userId });

    if (!cartItems.length) {
      return res.status(404).json({ message: 'No items found in cart' });
    }

    const cart = await Promise.all(cartItems.map(async cartItem => {
      const product = await Products.findById(cartItem.productId);

      if (!product) {
        return null; // Skip items with missing products
      }

      return {
        _id: cartItem._id,
        productImg: product.productImage,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity: cartItem.quantity
      };
    }));

    return res.json({ message: 'success', cart: cart.filter(item => item !== null) });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({ error: 'Invalid cartItemId' });
    }

    const deletedCartItem = await CartItem.findByIdAndDelete(cartItemId);
    if (!deletedCartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCartByUserID = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const cartItems = await CartItem.find({ userId });
    const cart = await Promise.all(cartItems.map(async cartItem => {
      const product = await Products.findById(cartItem.productId);
      if (!product) {
        return null; // Skip items with missing products
      }

      return {
        _id: cartItem._id,
        productImg: product.productImage,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity: cartItem.quantity
      };
    }));

    return res.json({ message: 'success', cart: cart.filter(item => item !== null) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addtocart,
  getCartItems,
  deleteCartItem,
  getCartByUserID
};
