const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Apply authentication middleware to all routes
// router.use(authMiddleware); // Temporarily disabled for development

// Consent callback endpoint - handles redirect from Setu (must be before parameterized routes)
router.get('/callback', consentController.consentCallback);

// Create consent request
router.post('/create', 
  validationMiddleware.validateConsentCreation,
  consentController.createConsent
);

// Get all consents for user
router.get('/', consentController.getUserConsents);

// Get consent by ID
router.get('/:consentId', 
  validationMiddleware.validateConsentId,
  consentController.getConsent
);

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