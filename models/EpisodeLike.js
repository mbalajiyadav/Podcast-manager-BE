const mongoose = require('mongoose');

const episodeLikeSchema = new mongoose.Schema({
    podcast_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Podcast',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    liked_at: {
        type: Date,
        default: Date.now
    }
});

episodeLikeSchema.index({ user_id: 1, podcast_id: 1 }, { unique: true });

module.exports = mongoose.model('EpisodeLike', episodeLikeSchema);
