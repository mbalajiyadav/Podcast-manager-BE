const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email_id: {
        type: String,
        required: true,
        unique: true
    },
    password_hash: {
        type: String,
        required: true
    },
    phone_number: {
        type: String
    },
    age: {
        type: Number
    },
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterRole',
        required: true
    },
    profile_image_key: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: true
    },
    last_login: {
        type: Date
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    followed_channels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
    }]
});

userSchema.pre('save', async function() {
    this.updated_on = Date.now();
});

module.exports = mongoose.model('User', userSchema);
