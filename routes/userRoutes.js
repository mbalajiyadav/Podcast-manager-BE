const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUserStatus, deleteUser, toggleFollowChannel } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Routes for both Listeners and Admins
router.post('/follow/:channelId', toggleFollowChannel);

// Admin only routes - specifically applied to each route
router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', authorize('ADMIN'), getUserById);
router.patch('/:id/status', authorize('ADMIN'), updateUserStatus);
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;
