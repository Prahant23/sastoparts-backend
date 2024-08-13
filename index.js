const express = require('express');
const dotenv = require('dotenv');
const connectToDB = require('./database/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const acceptMultimedia = require('connect-multiparty');
const bookingRoutes = require('./routes/bookingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const https = require('https');
const fs = require('fs');

// creating an express app
const app = express();

// configuring dotenv to use the .env file
dotenv.config();

// Load the SSL certificate and private key
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Set up Redis client with legacy mode enabled
// Configure Redis client
const redisClient = redis.createClient({
    socket: {
      host: 'localhost', // Since Redis is running locally
      port: 6379,        // Default Redis port
    }
  });
  
// Handle Redis errors
redisClient.on('error', (err) => console.error('Redis error:', err));

// Connect to Redis
redisClient.connect().catch(console.error);

// Use Redis client in your session middleware or other parts of your app
redisClient.on('connect', () => {
    console.log('Connected to Redis server');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('end', () => {
    console.log('Redis client disconnected');
});

// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

app.use(acceptMultimedia());

// Cors config to accept request from frontend
const corsOptions = {
    origin: ['http://localhost:3000','http://localhost:3001' ],// Your frontend URL
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1); // Trust first proxy

// connecting to database
connectToDB();

// accepting json data
app.use(express.json());

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,  // Use session secret from .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Use true to ensure cookies are only sent over HTTPS
        httpOnly: true, // Prevents JavaScript access to cookies
        maxAge: 1000 * 60 * 30, // 30 minutes
        sameSite: 'Strict' // Protects against CSRF attacks
    }
}));

// Importing routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/product', require('./routes/productRoutes')); // corrected to match route prefix
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/createorder', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/shipping', shippingRoutes);

// Defining port
const PORT = process.env.PORT || 5000;

// Create an HTTPS server and run it
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server running on port: ${PORT}`);
});

module.exports = app;
