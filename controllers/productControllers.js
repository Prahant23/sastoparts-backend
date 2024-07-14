const Products = require("../model/productModel");
const User = require("../model/userModel");
const cloudinary = require("cloudinary").v2; // Ensure correct import of cloudinary

// Create product
const createProduct = async (req, res) => {
  // Destructure incoming data
  const { productName, productPrice, productCategory, productDescription } = req.body;
  const { productImage } = req.files;

  // Validate data
  if (!productName || !productPrice || !productCategory || !productDescription || !productImage) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  try {
    // Upload image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(productImage.path, {
      folder: "products",
      crop: "scale"
    });

    // Save to database
    const newProduct = new Products({
      productName,
      productPrice,
      productCategory,
      productDescription,
      productImage: uploadedImage.secure_url,
    });
    await newProduct.save();

    res.status(200).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const allProducts = await Products.find({});
    res.status(200).json({
      success: true,
      message: "All Products",
      products: allProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Fetch single product
const getSingleProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const singleProduct = await Products.findById(productId);
    if (!singleProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Single Product",
      product: singleProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id; // Ensure the parameter name matches
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Ensure the user's ID is available from authentication
    const userId = req.user.id;
    if (userId.toString() !== product.owner.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this product.",
      });
    }

    // Delete the product image from Cloudinary
    const publicId = product.productImage.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`products/${publicId}`);

    // Delete the product from the database
    await Products.findByIdAndDelete(productId);

    // Remove the product ID from the user's products array
    const user = await User.findById(userId);
    user.product = user.product.filter((id) => id.toString() !== productId.toString());
    await user.save();

    res.json({
      success: true,
      message: "Product deleted successfully.",
      deletedProduct: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Update product
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { productName, productPrice, productCategory, productDescription } = req.body;

  try {
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update fields if they are provided
    if (productName) product.productName = productName;
    if (productPrice) product.productPrice = productPrice;
    if (productCategory) product.productCategory = productCategory;
    if (productDescription) product.productDescription = productDescription;

    // Handle product image update
    if (req.files && req.files.productImage) {
      const productImage = req.files.productImage.path;
      // Delete old image from cloudinary
      const publicId = product.productImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
      // Upload new image
      const uploadedImage = await cloudinary.uploader.upload(productImage, {
        folder: "products",
        crop: "scale"
      });
      product.productImage = uploadedImage.secure_url;
    }

    await product.save();
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


module.exports = { createProduct, getProducts, getSingleProduct, deleteProduct,updateProduct };
  