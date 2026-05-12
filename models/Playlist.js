const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    podcast_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Podcast',
        required: true
    },
    saved_at: {
        type: Date,
        default: Date.now
    }
});

playlistSchema.index({ user_id: 1, podcast_id: 1 }, { unique: true });

module.exports = mongoose.model('Playlist', playlistSchema);
