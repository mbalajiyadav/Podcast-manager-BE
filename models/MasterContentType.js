const mongoose = require('mongoose');

const masterContentTypeSchema = new mongoose.Schema({
    type_code: {
        type: String,
        required: true,
        unique: true
    },
    type_description: {
        type: String,
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

masterContentTypeSchema.pre('save', function(next) {
    this.updated_on = Date.now();
    next();
});

module.exports = mongoose.model('MasterContentType', masterContentTypeSchema);
