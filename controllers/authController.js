const User = require('../models/User');
const MasterRole = require('../models/MasterRole');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { first_name, last_name, email_id, password, role_code, phone_number, age } = req.body;

    try {
        const userExists = await User.findOne({ email_id });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const role = await MasterRole.findOne({ role_code });
        if (!role) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const user = await User.create({
            first_name,
            last_name,
            email_id,
            password_hash,
            role_id: role._id,
            phone_number,
            age
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email_id: user.email_id,
                role: role.role_code,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email_id, password } = req.body;

    try {
        const user = await User.findOne({ email_id }).populate('role_id');

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            user.last_login = Date.now();
            await user.save();

            res.json({
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email_id: user.email_id,
                role: user.role_id ? user.role_id.role_code : 'LISTENER',
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).populate('role_id');
    if (user) {
        res.json({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email_id: user.email_id,
            role: user.role_id.role_code,
            phone_number: user.phone_number,
            age: user.age,
            profile_image_key: user.profile_image_key
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.first_name = req.body.first_name || user.first_name;
        user.last_name = req.body.last_name || user.last_name;
        user.phone_number = req.body.phone_number || user.phone_number;
        user.age = req.body.age || user.age;
        user.profile_image_key = req.body.profile_image_key || user.profile_image_key;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            email_id: updatedUser.email_id,
            phone_number: updatedUser.phone_number,
            age: updatedUser.age,
            profile_image_key: updatedUser.profile_image_key
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { old_password, new_password } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await bcrypt.compare(old_password, user.password_hash))) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(new_password, salt);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } else {
        res.status(401).json({ message: 'Invalid old password' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateMe,
    changePassword
};
