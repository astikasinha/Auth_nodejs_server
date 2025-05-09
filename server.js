const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Load environment variables
dotenv.config({
    path: './config/config.env'
});

// Middleware setup
app.use(morgan('dev')); // Logs HTTP requests in dev mode
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded requests
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors()); // Enables cross-origin requests

// Connect to the database
connectDB();

// API Routes
app.use('/api/auth/authproj', require('./routes/user'));

// Generic Error Handling
app.use((err, req, res, next) => {
    console.error(err.message || err);  // Log error
    res.status(500).json({
        success: false,
        msg: 'Server Error'
    });
});

// Set the port from the environment or default to 3001
const PORT = process.env.PORT || 3001;

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`.red.underline.bold);
});

// Graceful shutdown for production environments
process.on('SIGTERM', () => {
    console.log('Server shutting down...');
    server.close(() => {
        console.log('Server shut down gracefully');
    });
});
