const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Single webhook endpoint that handles both consent and data notifications from Setu
router.post('/setu', webhookController.handleSetuWebhook);

// Legacy endpoints for backward compatibility
router.post('/consent', webhookController.handleConsentWebhook);
router.post('/data', webhookController.handleDataWebhook);
router.post('/periodic-refresh', webhookController.handlePeriodicRefresh);
router.post('/consent-expiry', webhookController.handleConsentExpiry);

module.exports = router; 