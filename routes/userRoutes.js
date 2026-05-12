const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUserStatus, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
