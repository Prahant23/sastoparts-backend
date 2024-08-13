const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  productPrice: {
    type: Number,
    required: [true, 'Product price is required'],
    trim: true,
    min: [0, 'Product price must be a positive number'],
  },
  productCategory: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
  },
  productDescription: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
  },
  productImage: {
    type: String,
    default: 'https://via.placeholder.com/150', // Default image URL if none provided
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance optimization
productSchema.index({ productName: 1 });
productSchema.index({ productCategory: 1 });

// Create the model from the schema
const Products = mongoose.model('Products', productSchema);

module.exports = Products;
