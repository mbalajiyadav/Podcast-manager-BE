const express = require('express');
const router = express.Router();
const { getPlaylist, addToPlaylist, removeFromPlaylist } = require('../controllers/playlistController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('LISTENER'));

router.get('/', getPlaylist);
router.post('/:episodeId', addToPlaylist);
router.delete('/:episodeId', removeFromPlaylist);

module.exports = router;
