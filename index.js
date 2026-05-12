require('dotenv').config();
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const connectDB = require('./config/db');
const router = require('./routes/router');

const app = express();

// Connect to Database
connectDB();

// Pre-load Models for Population
require('./models/MasterRole');
require('./models/MasterContentType');
require('./models/MasterApprovalStatus');
require('./models/User');
require('./models/Channel');
require('./models/Podcast');
require('./models/PlayHistory');
require('./models/EpisodeLike');
require('./models/Playlist');

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

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);