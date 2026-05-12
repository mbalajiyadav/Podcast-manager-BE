const express = require('express');
const router = express.Router();
const { getAudioPresign, getImagePresign, getAvatarPresign } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/audio-presign', protect, authorize('HOST'), getAudioPresign);
router.post('/image-presign', protect, authorize('HOST'), getImagePresign);
router.post('/avatar-presign', protect, getAvatarPresign);

module.exports = router;
