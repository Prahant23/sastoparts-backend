const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    productPrice: {
        type: Number,
        required: true,
        trim: true
    },
    productCategory: {
        type: String,
        required: true,
    
    },
    productDescription: {
        type: String,
        required: true,
        trim: true
    },
    productImage: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    
},
);



const Products = mongoose.model("products", productSchema);
module.exports=Products;