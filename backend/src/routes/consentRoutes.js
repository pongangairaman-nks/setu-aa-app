const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Apply authentication middleware to all routes
// router.use(authMiddleware); // Temporarily disabled for development

// Create consent request
router.post('/create', 
  validationMiddleware.validateConsentCreation,
  consentController.createConsent
);

// Get consent by ID
router.get('/:consentId', 
  validationMiddleware.validateConsentId,
  consentController.getConsent
);

// Get all consents for user
router.get('/', consentController.getUserConsents);

// Update consent status
router.patch('/:consentId/status',
  validationMiddleware.validateConsentId,
  validationMiddleware.validateStatusUpdate,
  consentController.updateConsentStatus
);

// Revoke consent
router.delete('/:consentId',
  validationMiddleware.validateConsentId,
  consentController.revokeConsent
);

// Get consent status
router.get('/:consentId/status',
  validationMiddleware.validateConsentId,
  consentController.getConsentStatus
);

module.exports = router; 