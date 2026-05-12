const express = require('express');
const router = express.Router();
const { createChannel, getChannels, getChannelById, updateChannel, deleteChannel, getMyChannels } = require('../controllers/channelController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getChannels);
router.get('/my', protect, authorize('HOST'), getMyChannels);
router.get('/:id', getChannelById);
router.post('/', protect, authorize('HOST'), createChannel);
router.put('/:id', protect, authorize('HOST'), updateChannel);
router.delete('/:id', protect, authorize('HOST'), deleteChannel);

module.exports = router;
