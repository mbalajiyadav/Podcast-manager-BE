require('dotenv').config();
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const connectDB = require('./config/db');
const router = require('./routes/router');

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept'
    ],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Podcast Backend is running'
    });
});

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);