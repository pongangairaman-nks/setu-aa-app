const Consent = require('../models/Consent');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const setuService = require('../services/setuService');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Verify webhook signature
const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// Handle consent webhook
exports.handleConsentWebhook = async (req, res) => {
  try {
    const { type, data, signature } = req.body;
    
    // Verify webhook signature
    const webhookSecret = process.env.SETU_WEBHOOK_SECRET;
    if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
      logger.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature'
        }
      });
    }

    if (type !== 'CONSENT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEBHOOK_TYPE',
          message: 'Invalid webhook type'
        }
      });
    }

    const { consentId, status, timestamp } = data;

    // Update consent status in database
    const consent = await Consent.findOneAndUpdate(
      { consentId },
      { 
        status, 
        lastUpdated: new Date(timestamp),
        webhookReceivedAt: new Date()
      },
      { new: true }
    );

    if (!consent) {
      logger.error(`Consent not found for webhook: ${consentId}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSENT_NOT_FOUND',
          message: 'Consent not found'
        }
      });
    }

    logger.info(`Consent webhook processed: ${consentId} -> ${status}`);

    // If consent is active, trigger data fetch
    if (status === 'ACTIVE') {
      // Fetch accounts and transactions for this consent
      try {
        await setuService.fetchAndStoreData(consentId, consent.userId);
        logger.info(`Data fetched for active consent: ${consentId}`);
      } catch (error) {
        logger.error(`Error fetching data for consent ${consentId}:`, error);
      }
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    logger.error('Error processing consent webhook:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Failed to process webhook'
      }
    });
  }
};

// Handle data webhook
exports.handleDataWebhook = async (req, res) => {
  try {
    const { type, data, signature } = req.body;
    
    // Verify webhook signature
    const webhookSecret = process.env.SETU_WEBHOOK_SECRET;
    if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
      logger.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature'
        }
      });
    }

    if (type !== 'DATA') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEBHOOK_TYPE',
          message: 'Invalid webhook type'
        }
      });
    }

    const { consentId, accountId, dataType, timestamp } = data;

    // Verify consent exists and is active
    const consent = await Consent.findOne({ consentId, status: 'ACTIVE' });
    if (!consent) {
      logger.error(`Active consent not found for data webhook: ${consentId}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSENT_NOT_FOUND',
          message: 'Active consent not found'
        }
      });
    }

    // Fetch and store the new data
    try {
      if (dataType === 'ACCOUNT') {
        await setuService.fetchAndStoreAccounts(consentId, consent.userId);
        logger.info(`Account data fetched for consent: ${consentId}`);
      } else if (dataType === 'TRANSACTION') {
        await setuService.fetchAndStoreTransactions(consentId, accountId, consent.userId);
        logger.info(`Transaction data fetched for consent: ${consentId}, account: ${accountId}`);
      }
    } catch (error) {
      logger.error(`Error fetching data for webhook: ${consentId}`, error);
    }

    logger.info(`Data webhook processed: ${consentId} -> ${dataType}`);

    res.json({
      success: true,
      message: 'Data webhook processed successfully'
    });
  } catch (error) {
    logger.error('Error processing data webhook:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Failed to process data webhook'
      }
    });
  }
};

// Handle periodic data refresh webhook
exports.handlePeriodicRefresh = async (req, res) => {
  try {
    const { type, data, signature } = req.body;
    
    // Verify webhook signature
    const webhookSecret = process.env.SETU_WEBHOOK_SECRET;
    if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
      logger.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature'
        }
      });
    }

    if (type !== 'PERIODIC_REFRESH') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEBHOOK_TYPE',
          message: 'Invalid webhook type'
        }
      });
    }

    const { consentId, timestamp } = data;

    // Verify consent exists and is active
    const consent = await Consent.findOne({ consentId, status: 'ACTIVE' });
    if (!consent) {
      logger.error(`Active consent not found for periodic refresh: ${consentId}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSENT_NOT_FOUND',
          message: 'Active consent not found'
        }
      });
    }

    // Fetch and store updated data
    try {
      await setuService.fetchAndStoreData(consentId, consent.userId);
      logger.info(`Periodic data refresh completed for consent: ${consentId}`);
    } catch (error) {
      logger.error(`Error in periodic refresh for consent ${consentId}:`, error);
    }

    res.json({
      success: true,
      message: 'Periodic refresh processed successfully'
    });
  } catch (error) {
    logger.error('Error processing periodic refresh webhook:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Failed to process periodic refresh'
      }
    });
  }
};

// Handle consent expiry webhook
exports.handleConsentExpiry = async (req, res) => {
  try {
    const { type, data, signature } = req.body;
    
    // Verify webhook signature
    const webhookSecret = process.env.SETU_WEBHOOK_SECRET;
    if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
      logger.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature'
        }
      });
    }

    if (type !== 'CONSENT_EXPIRY') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEBHOOK_TYPE',
          message: 'Invalid webhook type'
        }
      });
    }

    const { consentId, timestamp } = data;

    // Update consent status to expired
    const consent = await Consent.findOneAndUpdate(
      { consentId },
      { 
        status: 'EXPIRED', 
        lastUpdated: new Date(timestamp),
        webhookReceivedAt: new Date()
      },
      { new: true }
    );

    if (!consent) {
      logger.error(`Consent not found for expiry webhook: ${consentId}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSENT_NOT_FOUND',
          message: 'Consent not found'
        }
      });
    }

    logger.info(`Consent expired: ${consentId}`);

    res.json({
      success: true,
      message: 'Consent expiry processed successfully'
    });
  } catch (error) {
    logger.error('Error processing consent expiry webhook:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Failed to process consent expiry'
      }
    });
  }
}; 