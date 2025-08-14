const { body, param, query, validationResult } = require('express-validator');

const validationMiddleware = {
  // Validate consent creation
  validateConsentCreation: [
    body('fipId')
      .notEmpty()
      .withMessage('FIP ID is required')
      .isString()
      .withMessage('FIP ID must be a string'),
    
    body('dataLife')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Data life must be between 1 and 365 days'),
    
    body('permissions')
      .isArray({ min: 1 })
      .withMessage('At least one permission is required')
      .custom((value) => {
        const validPermissions = ['ACCOUNT', 'TRANSACTIONS', 'PROFILE', 'STATEMENTS'];
        return value.every(permission => validPermissions.includes(permission));
      })
      .withMessage('Invalid permissions provided'),
    
    body('fetchType')
      .optional()
      .isIn(['PERIODIC', 'ONETIME'])
      .withMessage('Fetch type must be either PERIODIC or ONETIME'),
    
    body('frequency.unit')
      .optional()
      .isIn(['MONTH', 'DAY', 'WEEK'])
      .withMessage('Frequency unit must be MONTH, DAY, or WEEK'),
    
    body('frequency.value')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Frequency value must be a positive integer'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Validate consent ID
  validateConsentId: [
    param('consentId')
      .notEmpty()
      .withMessage('Consent ID is required')
      .isString()
      .withMessage('Consent ID must be a string'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Validate status update
  validateStatusUpdate: [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'REJECTED'])
      .withMessage('Invalid status provided'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Validate data fetch
  validateDataFetch: [
    body('consentId')
      .notEmpty()
      .withMessage('Consent ID is required')
      .isString()
      .withMessage('Consent ID must be a string'),
    
    body('dataRange.from')
      .optional()
      .isISO8601()
      .withMessage('From date must be a valid ISO 8601 date'),
    
    body('dataRange.to')
      .optional()
      .isISO8601()
      .withMessage('To date must be a valid ISO 8601 date'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Validate account ID
  validateAccountId: [
    param('accountId')
      .notEmpty()
      .withMessage('Account ID is required')
      .isString()
      .withMessage('Account ID must be a string'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Validate balance update
  validateBalanceUpdate: [
    body('balance')
      .notEmpty()
      .withMessage('Balance is required')
      .isNumeric()
      .withMessage('Balance must be a number'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Validate transaction ID
  validateTransactionId: [
    param('transactionId')
      .notEmpty()
      .withMessage('Transaction ID is required')
      .isString()
      .withMessage('Transaction ID must be a string'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Validate pagination parameters
  validatePagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Validate date range
  validateDateRange: [
    query('fromDate')
      .optional()
      .isISO8601()
      .withMessage('From date must be a valid ISO 8601 date'),
    
    query('toDate')
      .optional()
      .isISO8601()
      .withMessage('To date must be a valid ISO 8601 date'),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      next();
    }
  ],

  // Generic validation handler
  handleValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    next();
  }
};

module.exports = validationMiddleware; 