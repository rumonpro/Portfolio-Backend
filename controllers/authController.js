const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Setup superadmin (One-time or protected)
// @route   POST /api/auth/setup
// @access  Public (Should be disabled after first use)
const setupSuperAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const userExists = await User.findOne({ role: 'superadmin' });
        if (userExists) {
            return res.status(400).json({ message: 'Superadmin already exists' });
        }

        const user = await User.create({
            username,
            password,
            role: 'superadmin'
        });

        if (user) {
            res.status(201).json({
                message: 'Superadmin created successfully',
                username: user.username
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    loginUser,
    setupSuperAdmin
};
