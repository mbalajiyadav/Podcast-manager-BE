const User = require('../models/User');
const Podcast = require('../models/Podcast');
const PlayHistory = require('../models/PlayHistory');
const MasterRole = require('../models/MasterRole');
const MasterApprovalStatus = require('../models/MasterApprovalStatus');
const MasterContentType = require('../models/MasterContentType');
const Channel = require('../models/Channel');

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res) => {
    try {
        const totalEpisodes = await Podcast.countDocuments();
        const totalPlays = await PlayHistory.countDocuments();
        
        const hostRole = await MasterRole.findOne({ role_code: 'HOST' });
        const listenerRole = await MasterRole.findOne({ role_code: 'LISTENER' });
        
        const totalHosts = hostRole ? await User.countDocuments({ role_id: hostRole._id }) : 0;
        const totalListeners = listenerRole ? await User.countDocuments({ role_id: listenerRole._id }) : 0;

        res.json({
            totalEpisodes,
            totalPlays,
            totalHosts,
            totalListeners
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all episodes with full info
// @route   GET /api/admin/episodes
// @access  Admin
const getAllEpisodesAdmin = async (req, res) => {
    try {
        const episodes = await Podcast.find()
            .populate('channel_id', 'name')
            .populate('user_id', 'first_name last_name email_id')
            .populate('approval_status_id')
            .populate('content_type_id')
            .sort({ created_on: -1 });
        res.json(episodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getAllEpisodesAdmin
};
