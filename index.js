const express = require('express');
const dotenv = require('dotenv');
const connectToDB = require('./database/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const acceptMultimedia = require('connect-multiparty');
const bookingRoutes = require('./routes/bookingRoutes');
const orderRoutes = require ('./routes/orderRoutes');
const shippingRoutes = require('./routes/shippingRoutes');

// creating an express app
const app = express();

// configuring dotenv to use the .env file
dotenv.config();

// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

app.use(acceptMultimedia());

// Cors config to accept request from frontend
const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// connecting to database
connectToDB();

// accepting json data
app.use(express.json());

// Importing routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/product', require('./routes/productRoutes')); // corrected to match route prefix
app.use('/api/cart', require('./routes/cartRoutes')); 
app.use('/api/createorder', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/shipping', require('./routes/shippingRoutes'));

// Defining port
const PORT = process.env.PORT || 5000;

// running the server on port 5000
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

module.exports = app;
