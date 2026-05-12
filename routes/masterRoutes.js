const express = require('express');
const router = express.Router();
const { getRoles, getContentTypes, createContentType, updateContentTypeStatus, getApprovalStatuses } = require('../controllers/masterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/roles', protect, authorize('ADMIN'), getRoles);
router.get('/content-types', getContentTypes);
router.post('/content-types', protect, authorize('ADMIN'), createContentType);
router.patch('/content-types/:id', protect, authorize('ADMIN'), updateContentTypeStatus);
router.get('/approval-statuses', protect, authorize('ADMIN'), getApprovalStatuses);

module.exports = router;
