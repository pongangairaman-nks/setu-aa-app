const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: { message: 'Access token required' }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: { message: 'User not found' }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: { message: 'Account is deactivated' }
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        error: { message: 'Account is temporarily locked due to too many failed login attempts' }
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: { message: 'Invalid token' }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { message: 'Token expired' }
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({
      error: { message: 'Authentication failed' }
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Middleware to check if user has specific role (for future use)
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Authentication required' }
      });
    }

    // For now, all authenticated users have access
    // You can add role-based logic here in the future
    next();
  };
};

/**
 * Middleware to rate limit login attempts
 */
const rateLimitLogin = (req, res, next) => {
  // This is a simple implementation
  // In production, you might want to use Redis or a more sophisticated rate limiter
  
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Simple in-memory store (not suitable for production with multiple instances)
  if (!global.loginAttempts) {
    global.loginAttempts = new Map();
  }
  
  const attempts = global.loginAttempts.get(clientIP) || { count: 0, resetTime: now + 15 * 60 * 1000 }; // 15 minutes
  
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + 15 * 60 * 1000;
  }
  
  if (attempts.count >= 5) {
    return res.status(429).json({
      error: { message: 'Too many login attempts. Please try again later.' }
    });
  }
  
  attempts.count++;
  global.loginAttempts.set(clientIP, attempts);
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  rateLimitLogin
}; 