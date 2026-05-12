const Playlist = require('../models/Playlist');
const Podcast = require('../models/Podcast');

// @desc    Get own saved episodes
// @route   GET /api/playlist
// @access  Listener
const getPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.find({ user_id: req.user._id })
            .populate({
                path: 'podcast_id',
                populate: [
                    { path: 'channel_id', select: 'name cover_image_key' },
                    { path: 'content_type_id', select: 'type_description' }
                ]
            })
            .sort({ saved_at: -1 });

        // Filter out any episodes that might have been deleted but still in playlist
        const validPlaylist = playlist.filter(item => item.podcast_id !== null);
        res.json(validPlaylist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save episode to playlist
// @route   POST /api/playlist/:episodeId
// @access  Listener
const addToPlaylist = async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.episodeId);
        if (!podcast) return res.status(404).json({ message: 'Episode not found' });

        const existing = await Playlist.findOne({ user_id: req.user._id, podcast_id: req.params.episodeId });
        if (existing) return res.status(400).json({ message: 'Already in playlist' });

        const item = await Playlist.create({
            user_id: req.user._id,
            podcast_id: req.params.episodeId
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Remove from playlist
// @route   DELETE /api/playlist/:episodeId
// @access  Listener
const removeFromPlaylist = async (req, res) => {
    try {
        const item = await Playlist.findOneAndDelete({ user_id: req.user._id, podcast_id: req.params.episodeId });
        if (item) res.json({ message: 'Removed from playlist' });
        else res.status(404).json({ message: 'Not found in playlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPlaylist,
    addToPlaylist,
    removeFromPlaylist
};
