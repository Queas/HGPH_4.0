const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authentication required.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Optional Authentication
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors in optional auth
    next();
  }
};

/**
 * Authorization Middleware
 * Checks if user has required role(s)
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert single role to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Check if user has allowed role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Permission-based authorization
 * Checks specific permission flags
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin always has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has the specific permission
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`
      });
    }

    next();
  };
};

/**
 * Access Level Check
 * Validates if user can access content based on access level
 */
const checkAccessLevel = (contentAccessLevel) => {
  const accessHierarchy = {
    'public': ['public', 'registered', 'researcher', 'restricted'],
    'registered': ['registered', 'researcher', 'restricted'],
    'researcher': ['researcher', 'restricted'],
    'restricted': ['restricted']
  };

  return (req, res, next) => {
    // Public content is always accessible
    if (contentAccessLevel === 'public') {
      return next();
    }

    // For non-public content, authentication is required
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this content'
      });
    }

    // Check if user role can access this level
    const userRole = req.user.role;
    const canAccess = 
      userRole === 'admin' || 
      (req.user.permissions && req.user.permissions.canAccessRestrictedKnowledge) ||
      accessHierarchy[userRole]?.includes(contentAccessLevel);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient access level for this content',
        required: contentAccessLevel,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Rate limiting middleware (simple implementation)
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    
    // Get user's request history
    const userRequests = requests.get(key) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, times] of requests.entries()) {
        if (times.every(t => now - t > windowMs)) {
          requests.delete(k);
        }
      }
    }
    
    next();
  };
};

/**
 * Validate request body against schema
 */
const validateRequest = (validationRules) => {
  return async (req, res, next) => {
    try {
      const errors = [];
      
      for (const [field, rules] of Object.entries(validationRules)) {
        const value = req.body[field];
        
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push({ field, message: `${field} is required` });
          continue;
        }
        
        if (value !== undefined && rules.type) {
          const actualType = Array.isArray(value) ? 'array' : typeof value;
          if (actualType !== rules.type) {
            errors.push({ field, message: `${field} must be of type ${rules.type}` });
          }
        }
        
        if (value && rules.minLength && value.length < rules.minLength) {
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
        }
        
        if (value && rules.maxLength && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} must not exceed ${rules.maxLength} characters` });
        }
      }
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkPermission,
  checkAccessLevel,
  rateLimit,
  validateRequest
};
