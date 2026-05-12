const express = require('express');
const router = express.Router();
const { 
    upload, 
    uploadAudio, 
    uploadImage, 
    uploadAvatar 
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Define the direct upload routes
router.post('/audio', protect, authorize('HOST'), upload.single('file'), uploadAudio);
router.post('/image',protect, authorize('HOST'), upload.single('file'), uploadImage);
router.post('/avatar', protect, upload.single('file'), uploadAvatar);

module.exports = router;
