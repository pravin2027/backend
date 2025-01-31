import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        // Check if user already exists with increased timeout
        const existingUser = await User.findOne({ email: req.body.email }).maxTimeMS(20000);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Validate password length before creating user
        if (!req.body.password || req.body.password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = new User(req.body);

        // Save user without maxTimeMS (it's not supported on save)
        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        // Handle timeout errors
        if (error.message.includes('buffering timed out after')) {
            return res.status(503).json({
                message: 'Database connection timeout. Please try again later.'
            });
        }

        res.status(400).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Find user with increased timeout
        const user = await User.findOne({ email }).maxTimeMS(20000);
        if (!user) {
            return res.status(401).json({
                message: 'Invalid login credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid login credentials'
            });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error during login. Please try again.'
        });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    res.json(req.user);
});

export default router;