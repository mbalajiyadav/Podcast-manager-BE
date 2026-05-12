const mongoose = require('mongoose');

const masterApprovalStatusSchema = new mongoose.Schema({
    approval_code: {
        type: String,
        required: true,
        unique: true
    },
    approval_description: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MasterApprovalStatus', masterApprovalStatusSchema);
