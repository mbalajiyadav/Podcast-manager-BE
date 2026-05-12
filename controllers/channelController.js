const Channel = require('../models/Channel');
const Podcast = require('../models/Podcast');
const MasterContentType = require('../models/MasterContentType');
const MasterApprovalStatus = require('../models/MasterApprovalStatus');
const User = require('../models/User');

// @desc    Create new channel
// @route   POST /api/channels
// @access  Host
const createChannel = async (req, res) => {
    const { name, description, cover_image_key, category_id } = req.body;
    try {
        const channel = await Channel.create({
            host_id: req.user._id,
            name,
            description,
            cover_image_key,
            category_id
        });
        res.status(201).json(channel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    List all channels
// @route   GET /api/channels
// @access  Public
const getChannels = async (req, res) => {
    try {
        const channels = await Channel.find({ is_active: true }).populate('host_id', 'first_name last_name').populate('category_id');
        res.json(channels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get channel details + episodes
// @route   GET /api/channels/:id
// @access  Public
const getChannelById = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id).populate('host_id', 'first_name last_name').populate('category_id');
        if (channel) {
            const episodes = await Podcast.find({ channel_id: channel._id, approval_status_id: (await require('../models/MasterApprovalStatus').findOne({ approval_code: 'APPROVED' }))._id });
            res.json({ channel, episodes });
        } else {
            res.status(404).json({ message: 'Channel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update channel
// @route   PUT /api/channels/:id
// @access  Host (Owner)
const updateChannel = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id);
        if (channel) {
            if (channel.host_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this channel' });
            }
            channel.name = req.body.name || channel.name;
            channel.description = req.body.description || channel.description;
            channel.cover_image_key = req.body.cover_image_key || channel.cover_image_key;
            channel.category_id = req.body.category_id || channel.category_id;

            const updatedChannel = await channel.save();
            res.json(updatedChannel);
        } else {
            res.status(404).json({ message: 'Channel not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete channel
// @route   DELETE /api/channels/:id
// @access  Host (Owner)
const deleteChannel = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id);
        if (channel) {
            if (channel.host_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to delete this channel' });
            }
            channel.is_active = false;
            await channel.save();
            res.json({ message: 'Channel deleted (soft delete)' });
        } else {
            res.status(404).json({ message: 'Channel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get own channels
// @route   GET /api/channels/my
// @access  Host
const getMyChannels = async (req, res) => {
    try {
        const channels = await Channel.find({ host_id: req.user._id, is_active: true }).populate('category_id');
        res.json(channels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createChannel,
    getChannels,
    getChannelById,
    updateChannel,
    deleteChannel,
    getMyChannels
};
