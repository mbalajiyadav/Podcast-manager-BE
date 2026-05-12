const express = require('express');
const router = express.Router();
const { getStats, getAllEpisodesAdmin } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/episodes', getAllEpisodesAdmin);

module.exports = router;
