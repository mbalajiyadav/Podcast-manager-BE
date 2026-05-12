const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    host_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    cover_image_key: {
        type: String
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterContentType',
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
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

channelSchema.pre('save', function() {
    this.updated_on = Date.now();
});

module.exports = mongoose.model('Channel', channelSchema);
