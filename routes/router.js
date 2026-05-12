const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const masterRoutes = require('./masterRoutes');
const userRoutes = require('./userRoutes');
const channelRoutes = require('./channelRoutes');
const episodeRoutes = require('./episodeRoutes');
const playlistRoutes = require('./playlistRoutes');
const uploadRoutes = require('./uploadRoutes');
const adminRoutes = require('./adminRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/master', masterRoutes);
router.use('/users', userRoutes);
router.use('/channels', channelRoutes);
router.use('/episodes', episodeRoutes);
router.use('/playlist', playlistRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
