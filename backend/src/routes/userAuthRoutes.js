const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { authenticateToken, rateLimitLogin } = require('../middleware/authMiddleware');

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: { message: 'Email, password, and name are required' }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: { message: 'User with this email already exists' }
      });
    }

    // Create new user (password will be hashed by the User model pre-save middleware)
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    logger.info(`New user registered: ${email}`);

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    res.status(201).json(userResponse);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: { message: 'Failed to register user' }
    });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', rateLimitLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: { message: 'Email and password are required' }
      });
    }

    // Find user
    const user = await User.findOne({ email });
    console.log('User:', user);
    if (!user) {
      return res.status(401).json({
        error: { message: 'Invalid email or password' }
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        error: { message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' }
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        error: { message: 'Invalid email or password' }
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);

    // Return user data and token
    const userResponse = {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };

    res.json(userResponse);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: { message: 'Failed to login' }
    });
  }
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User is already authenticated and available in req.user
    const userResponse = {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      createdAt: req.user.createdAt
    };

    res.json(userResponse);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      error: { message: 'Failed to get user' }
    });
  }
});

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement a blacklist here if needed
    logger.info('User logged out');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: { message: 'Failed to logout' }
    });
  }
});

module.exports = router;
