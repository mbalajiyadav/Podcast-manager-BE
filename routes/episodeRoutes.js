const express = require('express');
const router = express.Router();
const { 
    uploadEpisode, 
    getEpisodes, 
    getEpisodeById, 
    updateEpisode, 
    deleteEpisode, 
    getMyEpisodes, 
    getPendingEpisodes,
    approveEpisode,
    rejectEpisode,
    logPlay,
    saveProgress,
    likeEpisode,
    unlikeEpisode
} = require('../controllers/episodeController');
const { protect, authorize, protectOptional } = require('../middleware/authMiddleware');

// Host/Specific routes (Must come before /:id)
router.get('/my', protect, authorize('HOST'), getMyEpisodes);
router.get('/pending', protect, authorize('ADMIN'), getPendingEpisodes);

// Public routes
router.get('/', getEpisodes);
router.get('/:id', protectOptional, getEpisodeById);
router.post('/:id/play', logPlay);

// Host routes (continued)
router.post('/', protect, authorize('HOST'), uploadEpisode);
router.put('/:id', protect, authorize('HOST'), updateEpisode);
router.delete('/:id', protect, authorize('HOST'), deleteEpisode);

// Listener routes
router.patch('/:id/progress', protect, authorize('LISTENER'), saveProgress);
router.post('/:id/like', protect, authorize('LISTENER'), likeEpisode);
router.delete('/:id/like', protect, authorize('LISTENER'), unlikeEpisode);

// Admin routes
router.get('/pending', protect, authorize('ADMIN'), getPendingEpisodes);
router.patch('/:id/approve', protect, authorize('ADMIN'), approveEpisode);
router.patch('/:id/reject', protect, authorize('ADMIN'), rejectEpisode);

module.exports = router;
