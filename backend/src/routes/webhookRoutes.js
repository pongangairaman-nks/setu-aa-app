const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Handle consent webhook
router.post('/consent', webhookController.handleConsentWebhook);

// Handle data webhook
router.post('/data', webhookController.handleDataWebhook);

// Handle periodic refresh webhook
router.post('/periodic-refresh', webhookController.handlePeriodicRefresh);

// Handle consent expiry webhook
router.post('/consent-expiry', webhookController.handleConsentExpiry);

module.exports = router; 