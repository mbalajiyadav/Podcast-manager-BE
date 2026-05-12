const Podcast = require('../models/Podcast');
const MasterApprovalStatus = require('../models/MasterApprovalStatus');
const MasterContentType = require('../models/MasterContentType');
const EpisodeLike = require('../models/EpisodeLike');
const PlayHistory = require('../models/PlayHistory');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const Channel = require('../models/Channel');

// @desc    Upload new episode
// @route   POST /api/episodes
// @access  Host
const uploadEpisode = async (req, res) => {
    const { channel_id, title, description, content_type_id, audio_s3_key, thumbnail_key, duration_in_seconds } = req.body;

    try {
        const pendingStatus = await MasterApprovalStatus.findOne({ approval_code: 'PENDING' });

        const episode = await Podcast.create({
            channel_id,
            user_id: req.user._id,
            title,
            description,
            content_type_id,
            audio_s3_key,
            thumbnail_key,
            duration_in_seconds,
            approval_status_id: pendingStatus._id
        });

        res.status(201).json(episode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Browse approved episodes
// @route   GET /api/episodes
// @access  Public
const getEpisodes = async (req, res) => {
    try {
        const approvedStatus = await MasterApprovalStatus.findOne({ approval_code: 'APPROVED' });
        const { category, search, channel } = req.query;

        let query = { approval_status_id: approvedStatus._id };

        if (category) query.content_type_id = category;
        if (channel) query.channel_id = channel;
        if (search) {
            query.$text = { $search: search };
        }

        const episodes = await Podcast.find(query)
            .populate('channel_id', 'name cover_image_key')
            .populate('content_type_id', 'type_description')
            .sort({ created_on: -1 });

        res.json(episodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single episode detail
// @route   GET /api/episodes/:id
// @access  Public
const getEpisodeById = async (req, res) => {
    try {
        const episode = await Podcast.findById(req.params.id)
            .populate('channel_id')
            .populate('content_type_id')
            .populate('approval_status_id')
            .populate('user_id', 'first_name last_name');

        if (episode) {
            // Business rule: Only show approved episodes to public/listeners
            // Hosts can see their own even if pending
            const approvedStatus = await MasterApprovalStatus.findOne({ approval_code: 'APPROVED' });
            if (episode.approval_status_id.approval_code !== 'APPROVED' &&
                (!req.user || req.user._id.toString() !== episode.user_id._id.toString())) {
                return res.status(403).json({ message: 'Episode not yet approved' });
            }
            res.json(episode);
        } else {
            res.status(404).json({ message: 'Episode not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Edit episode
// @route   PUT /api/episodes/:id
// @access  Host (Owner)
const updateEpisode = async (req, res) => {
    try {
        const episode = await Podcast.findById(req.params.id);
        if (episode) {
            if (episode.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            episode.title = req.body.title || episode.title;
            episode.description = req.body.description || episode.description;
            episode.content_type_id = req.body.content_type_id || episode.content_type_id;
            episode.thumbnail_key = req.body.thumbnail_key || episode.thumbnail_key;

            const updatedEpisode = await episode.save();
            res.json(updatedEpisode);
        } else {
            res.status(404).json({ message: 'Episode not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete episode
// @route   DELETE /api/episodes/:id
// @access  Host (Owner)
const deleteEpisode = async (req, res) => {
    try {
        const episode = await Podcast.findById(req.params.id).populate('approval_status_id');
        if (episode) {
            if (episode.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            // Business rule: Only allow delete if PENDING or REJECTED
            const status = episode.approval_status_id.approval_code;
            if (status === 'APPROVED') {
                return res.status(400).json({ message: 'Approved episodes cannot be deleted' });
            }

            await episode.deleteOne();
            res.json({ message: 'Episode removed' });
        } else {
            res.status(404).json({ message: 'Episode not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get own episodes
// @route   GET /api/episodes/my
// @access  Host
const getMyEpisodes = async (req, res) => {
    try {
        const episodes = await Podcast.find({ user_id: req.user._id })
            .populate('channel_id', 'name')
            .populate('approval_status_id')
            .populate('content_type_id')
            .sort({ created_on: -1 });
        res.json(episodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    List pending episodes for admin
// @route   GET /api/episodes/pending
// @access  Admin
const getPendingEpisodes = async (req, res) => {
    try {
        const pendingStatus = await MasterApprovalStatus.findOne({ approval_code: 'PENDING' });
        const episodes = await Podcast.find({ approval_status_id: pendingStatus._id })
            .populate('channel_id', 'name')
            .populate('user_id', 'first_name last_name email_id')
            .populate('content_type_id');
        res.json(episodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve episode
// @route   PATCH /api/episodes/:id/approve
// @access  Admin
const approveEpisode = async (req, res) => {
    try {
        const approvedStatus = await MasterApprovalStatus.findOne({ approval_code: 'APPROVED' });
        const episode = await Podcast.findByIdAndUpdate(req.params.id, {
            approval_status_id: approvedStatus._id,
            rejection_reason: null
        }, { new: true });

        if (episode) res.json(episode);
        else res.status(404).json({ message: 'Episode not found' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reject episode
// @route   PATCH /api/episodes/:id/reject
// @access  Admin
const rejectEpisode = async (req, res) => {
    const { reason } = req.body;
    try {
        const rejectedStatus = await MasterApprovalStatus.findOne({ approval_code: 'REJECTED' });
        const episode = await Podcast.findByIdAndUpdate(req.params.id, {
            approval_status_id: rejectedStatus._id,
            rejection_reason: reason
        }, { new: true });

        if (episode) res.json(episode);
        else res.status(404).json({ message: 'Episode not found' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Log play event
// @route   POST /api/episodes/:id/play
// @access  All
const logPlay = async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.id);
        if (podcast) {
            await PlayHistory.create({
                podcast_id: podcast._id,
                user_id: req.user ? req.user._id : null
            });
            podcast.views_count += 1;
            await podcast.save();
            res.json({ message: 'Play logged' });
        } else {
            res.status(404).json({ message: 'Episode not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save playback progress
// @route   PATCH /api/episodes/:id/progress
// @access  Listener
const saveProgress = async (req, res) => {
    const { seconds } = req.body;
    try {
        const episode = await Podcast.findById(req.params.id);
        if (!episode) return res.status(404).json({ message: 'Episode not found' });

        const completed = seconds >= (episode.duration_in_seconds * 0.9);

        await PlayHistory.findOneAndUpdate(
            { user_id: req.user._id, podcast_id: req.params.id },
            { progress_seconds: seconds, completed, played_at: Date.now() },
            { upsert: true, new: true }
        );
        res.json({ message: 'Progress saved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like episode
// @route   POST /api/episodes/:id/like
// @access  Listener
const likeEpisode = async (req, res) => {
    try {
        const existingLike = await EpisodeLike.findOne({ user_id: req.user._id, podcast_id: req.params.id });
        if (existingLike) return res.status(400).json({ message: 'Already liked' });

        await EpisodeLike.create({ user_id: req.user._id, podcast_id: req.params.id });

        const podcast = await Podcast.findById(req.params.id);
        podcast.likes_count += 1;
        await podcast.save();

        res.json({ message: 'Liked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unlike episode
// @route   DELETE /api/episodes/:id/like
// @access  Listener
const unlikeEpisode = async (req, res) => {
    try {
        const existingLike = await EpisodeLike.findOneAndDelete({ user_id: req.user._id, podcast_id: req.params.id });
        if (!existingLike) return res.status(400).json({ message: 'Not liked' });

        const podcast = await Podcast.findById(req.params.id);
        podcast.likes_count = Math.max(0, podcast.likes_count - 1);
        await podcast.save();

        res.json({ message: 'Unliked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadEpisode,
    getEpisodes,
    getEpisodeById,
    updateEpisode,
    deleteEpisode,
    getMyEpisodes,
    getPendingEpisodes,
    approveEpisode,
    rejectEpisode,
    logPlay,
    saveProgress,
    likeEpisode,
    unlikeEpisode
};
