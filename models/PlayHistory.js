const mongoose = require('mongoose');

const playHistorySchema = new mongoose.Schema({
    podcast_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Podcast',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    progress_seconds: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    played_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PlayHistory', playHistorySchema);
