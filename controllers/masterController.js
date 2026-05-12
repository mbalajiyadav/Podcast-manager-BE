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

// @desc    Seed master data (Temporary endpoint for initial setup)
// @route   GET /api/master/seed
// @access  Public (Temporary)
const seedMasterData = async (req, res) => {
    try {
        const roles = [
            { role_code: 'ADMIN', role_description: 'Platform Administrator' },
            { role_code: 'HOST', role_description: 'Podcast Host / Uploader' },
            { role_code: 'LISTENER', role_description: 'Standard Listener' }
        ];

        const contentTypes = [
            { type_code: 'MUSIC', type_description: 'Music' },
            { type_code: 'TRUE_CRIME', type_description: 'True Crime' },
            { type_code: 'COMEDY', type_description: 'Comedy' },
            { type_code: 'NEWS', type_description: 'News' },
            { type_code: 'HEALTH', type_description: 'Health' },
            { type_code: 'BUSINESS', type_description: 'Business' },
            { type_code: 'HISTORY', type_description: 'History' },
            { type_code: 'SELF_IMPROVEMENT', type_description: 'Self-improvement' },
            { type_code: 'SPORTS', type_description: 'Sports' },
            { type_code: 'STORYTELLING', type_description: 'Storytelling' },
            { type_code: 'RELIGION', type_description: 'Religion' },
            { type_code: 'DJ_MIXES', type_description: 'DJ Mixes' }
        ];

        const approvalStatuses = [
            { approval_code: 'PENDING', approval_description: 'Awaiting Review' },
            { approval_code: 'APPROVED', approval_description: 'Approved and Published' },
            { approval_code: 'REJECTED', approval_description: 'Rejected by Admin' }
        ];

        await MasterRole.deleteMany({});
        await MasterRole.insertMany(roles);

        await MasterContentType.deleteMany({});
        await MasterContentType.insertMany(contentTypes);

        await MasterApprovalStatus.deleteMany({});
        await MasterApprovalStatus.insertMany(approvalStatuses);

        res.json({ message: 'Master data seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoles,
    getContentTypes,
    createContentType,
    updateContentTypeStatus,
    getApprovalStatuses,
    seedMasterData
};
