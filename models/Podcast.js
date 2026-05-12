const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
    channel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    content_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterContentType',
        required: true
    },
    approval_status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterApprovalStatus',
        required: true
    },
    audio_s3_key: {
        type: String,
        required: true
    },
    thumbnail_key: {
        type: String
    },
    content_url: {
        type: String
    },
    duration_in_seconds: {
        type: Number,
        default: 0
    },
    likes_count: {
        type: Number,
        default: 0
    },
    views_count: {
        type: Number,
        default: 0
    },
    rejection_reason: {
        type: String
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    }
});

podcastSchema.index({ title: 'text', description: 'text' });

podcastSchema.pre('save', function() {
    this.updated_on = Date.now();
});

module.exports = mongoose.model('Podcast', podcastSchema);
