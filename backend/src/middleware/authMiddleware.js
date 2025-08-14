const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No token provided.'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token. User not found.'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INACTIVE_USER',
          message: 'User account is deactivated.'
        }
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'LOCKED_ACCOUNT',
          message: 'Account is temporarily locked due to multiple failed login attempts.'
        }
      });
    }

    // Add user to request object
    req.user = user;
    
    // Update last activity
    user.lastActivityAt = new Date();
    await user.save();

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token.'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'EXPIRED_TOKEN',
          message: 'Token has expired.'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error occurred.'
      }
    });
  }
};

module.exports = authMiddleware; 