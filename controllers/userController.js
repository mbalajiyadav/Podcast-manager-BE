const User = require('../models/User');

// @desc    List all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        let query = {};

        if (role) query.role_id = role;
        if (status !== undefined) query.is_active = status === 'active';
        if (search) {
            query.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { email_id: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).populate('role_id').sort({ created_on: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role_id');
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user status
// @route   PATCH /api/users/:id/status
// @access  Admin
const updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.is_active = req.body.is_active !== undefined ? req.body.is_active : user.is_active;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUserStatus,
    deleteUser
};
