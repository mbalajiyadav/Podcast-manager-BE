const mongoose = require('mongoose');

const masterRoleSchema = new mongoose.Schema({
    role_code: {
        type: String,
        required: true,
        unique: true
    },
    role_description: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MasterRole', masterRoleSchema);
