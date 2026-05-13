const User = require('../models/User');

// @desc    List all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        let query = {};

        if (role) {
            const roleObj = await require('../models/MasterRole').findOne({ role_code: role });
            if (roleObj) query.role_id = roleObj._id;
        }
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
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userData = user.toObject();

        // If user is a host, fetch their stats
        if (user.role_id && user.role_id.role_code === 'HOST') {
            const Podcast = require('../models/Podcast');
            const episodes = await Podcast.find({ user_id: user._id }).populate('approval_status_id');
            
            userData.stats = {
                totalEpisodes: episodes.length,
                totalPlays: episodes.reduce((acc, ep) => acc + (ep.views_count || 0), 0),
                approved: episodes.filter(ep => ep.approval_status_id?.approval_code === 'APPROVED').length,
                rejected: episodes.filter(ep => ep.approval_status_id?.approval_code === 'REJECTED').length
            };

            // Also include their recent episodes for the admin to see
            userData.recentEpisodes = episodes.slice(0, 5).map(ep => ({
                id: ep._id,
                title: ep.title,
                duration: `${Math.floor(ep.duration_in_seconds / 60)} min`,
                status: ep.approval_status_id?.approval_code
            }));
        }

        res.json(userData);
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

// @desc    Toggle follow/unfollow a channel
// @route   POST /api/users/follow/:channelId
// @access  Private
const toggleFollowChannel = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const channelId = req.params.channelId;

        const isFollowing = user.followed_channels.includes(channelId);

        if (isFollowing) {
            user.followed_channels = user.followed_channels.filter(id => id.toString() !== channelId);
        } else {
            user.followed_channels.push(channelId);
        }

        await user.save();
        res.json({ success: true, isFollowing: !isFollowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    toggleFollowChannel
};
