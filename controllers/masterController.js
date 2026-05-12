const MasterRole = require('../models/MasterRole');
const MasterContentType = require('../models/MasterContentType');
const MasterApprovalStatus = require('../models/MasterApprovalStatus');

// @desc    Get all roles
// @route   GET /api/master/roles
// @access  Admin
const getRoles = async (req, res) => {
    try {
        const roles = await MasterRole.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all content types
// @route   GET /api/master/content-types
// @access  Public
const getContentTypes = async (req, res) => {
    try {
        const types = await MasterContentType.find({ is_active: true });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new category
// @route   POST /api/master/content-types
// @access  Admin
const createContentType = async (req, res) => {
    const { type_code, type_description } = req.body;
    try {
        const type = await MasterContentType.create({ type_code, type_description });
        res.status(201).json(type);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Enable/Disable category
// @route   PATCH /api/master/content-types/:id
// @access  Admin
const updateContentTypeStatus = async (req, res) => {
    try {
        const type = await MasterContentType.findById(req.params.id);
        if (type) {
            type.is_active = req.body.is_active !== undefined ? req.body.is_active : type.is_active;
            const updatedType = await type.save();
            res.json(updatedType);
        } else {
            res.status(404).json({ message: 'Content type not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all approval statuses
// @route   GET /api/master/approval-statuses
// @access  Admin
const getApprovalStatuses = async (req, res) => {
    try {
        const statuses = await MasterApprovalStatus.find();
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoles,
    getContentTypes,
    createContentType,
    updateContentTypeStatus,
    getApprovalStatuses
};
