// importing Packages
const express = require('express');
const dotenv = require('dotenv');
const connectToDB = require('./database/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2; // Ensure you have the correct cloudinary version
const acceptMultimedia = require('connect-multiparty');
const bookingRoutes = require('./routes/bookingRoutes');

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
app.use('/api/product', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes')); // cart routes updated
app.use('/api/order', require('./routes/orderRoutes'));
app.use('/api/bookings', bookingRoutes); // updated to follow API route pattern

// Defining port
const PORT = process.env.PORT || 5000; // Fallback to 5000 if PORT is not defined

// running the server on port 5000
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

module.exports = app;
