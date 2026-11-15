const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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

        const defaultAdmin = process.env.ADMIN_USERNAME || 'Admin';
        const defaultPass = process.env.ADMIN_PASSWORD || 'mdrumonKhan21';

        // Check if matching configured admin credentials
        if (username === defaultAdmin && password === defaultPass) {
            // If database is connected, ensure admin exists in DB
            if (mongoose.connection.readyState === 1) {
                try {
                    let user = await User.findOne({ username: defaultAdmin });
                    if (!user) {
                        user = await User.create({
                            username: defaultAdmin,
                            password: defaultPass,
                            role: 'superadmin'
                        });
                    }
                    return res.json({
                        _id: user._id,
                        username: user.username,
                        role: user.role,
                        token: generateToken(user._id)
                    });
                } catch (dbErr) {
                    console.warn('DB sync warning in login:', dbErr.message);
                }
            }

            return res.json({
                _id: 'admin_master_id',
                username: defaultAdmin,
                role: 'superadmin',
                token: generateToken('admin_master_id')
            });
        }

        // Otherwise check in MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            const user = await User.findOne({ username });

            if (user && (await user.matchPassword(password))) {
                return res.json({
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user._id)
                });
            }
        }

        return res.status(401).json({ message: 'Invalid username or password' });
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
