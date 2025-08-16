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

// Unified webhook handler for Setu notifications
exports.handleSetuWebhook = async (req, res) => {
  try {
    const { type } = req.body;
    
    logger.info(`Received Setu webhook: ${type}`);

    // Route to appropriate handler based on webhook type
    switch (type) {
      case 'CONSENT_STATUS_UPDATE':
        return await exports.handleConsentWebhook(req, res);
      case 'SESSION_STATUS_UPDATE':
        return await exports.handleDataWebhook(req, res);
      default:
        logger.error(`Unknown webhook type: ${type}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNKNOWN_WEBHOOK_TYPE',
            message: `Unknown webhook type: ${type}`
          }
        });
    }
  } catch (error) {
    logger.error('Error in unified webhook handler:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Failed to process webhook'
      }
    });
  }
};

// Handle consent status update webhook (CONSENT_STATUS_UPDATE)
exports.handleConsentWebhook = async (req, res) => {
  try {
    const { type, data, signature, consentId, timestamp, success, error } = req.body;
    
    logger.info(`Received webhook: ${type} for consent: ${consentId}`);

    // Verify webhook signature if provided
    if (signature) {
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
    }

    if (type !== 'CONSENT_STATUS_UPDATE') {
      logger.error(`Invalid webhook type: ${type}`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEBHOOK_TYPE',
          message: 'Invalid webhook type'
        }
      });
    }

    // Handle error cases (UserCancelled, UserRejected, etc.)
    if (!success && error) {
      logger.info(`Consent error: ${error.code} - ${error.message} for consent: ${consentId}`);
      
      // Update consent status based on error
      let status = 'REJECTED';
      if (error.code === 'UserCancelled') {
        status = 'PENDING'; // User cancelled before login, consent can be reused
      } else if (error.code === 'UserRejected') {
        status = 'REJECTED';
      } else if (error.code === 'NoFIPAccountsDiscovered') {
        status = 'REJECTED';
      } else if (error.code === 'FIPDenied') {
        status = 'REJECTED';
      }

      const updateData = {
        status, 
        lastUpdated: timestamp ? new Date(timestamp) : new Date(),
        webhookReceivedAt: new Date(),
        errorCode: error.code,
        errorMessage: error.message
      };

      // If this is a new consent (upsert), set required fields
      const existingConsent = await Consent.findOne({ consentId });
      if (!existingConsent) {
        updateData.createdAt = new Date();
        updateData.expiresAt = new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)); // 180 days from now
        updateData.deleteAt = new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)); // 180 days from now
        updateData.userId = '000000000000000000000000'; // Default ObjectId for system
        updateData.fipId = 'setu-fip';
        updateData.fipName = 'Setu FIP';
        updateData.dataLife = 180;
        updateData.permissions = ['ACCOUNT', 'TRANSACTIONS'];
        updateData.fetchType = 'PERIODIC';
      }

      await Consent.findOneAndUpdate(
        { consentId },
        updateData,
        { new: true, upsert: true }
      );

      return res.json({
        success: true,
        message: 'Error webhook processed successfully'
      });
    }

    // Handle successful consent status updates
    if (success && data) {
      const { status, detail } = data;
      
      logger.info(`Consent status update: ${consentId} -> ${status}`);

      // Update consent status in database
      const updateData = {
        status, 
        lastUpdated: timestamp ? new Date(timestamp) : new Date(),
        webhookReceivedAt: new Date(),
        accounts: detail?.accounts || []
      };

      // If this is a new consent (upsert), set required fields
      const existingConsent = await Consent.findOne({ consentId });
      if (!existingConsent) {
        updateData.createdAt = new Date();
        updateData.expiresAt = new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)); // 180 days from now
        updateData.deleteAt = new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)); // 180 days from now
        updateData.userId = '000000000000000000000000'; // Default ObjectId for system
        updateData.fipId = 'setu-fip';
        updateData.fipName = 'Setu FIP';
        updateData.dataLife = 180;
        updateData.permissions = ['ACCOUNT', 'TRANSACTIONS'];
        updateData.fetchType = 'PERIODIC';
      }

      const consent = await Consent.findOneAndUpdate(
        { consentId },
        updateData,
        { new: true, upsert: true }
      );

      // If consent is active, trigger data fetch
      if (status === 'ACTIVE' && detail?.accounts) {
        try {
          // Store account information
          for (const account of detail.accounts) {
            await Account.findOneAndUpdate(
              { linkRefNumber: account.linkRefNumber },
              {
                consentId,
                maskedAccNumber: account.maskedAccNumber,
                accType: account.accType,
                fipId: account.fipId,
                fiType: account.fiType,
                linkRefNumber: account.linkRefNumber,
                status: 'ACTIVE',
                lastUpdated: new Date()
              },
              { new: true, upsert: true }
            );
          }
          
          logger.info(`Accounts stored for active consent: ${consentId}`);
        } catch (error) {
          logger.error(`Error storing accounts for consent ${consentId}:`, error);
        }
      }
    }

    res.json({
      success: true,
      message: 'Consent webhook processed successfully'
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

// Handle data session status update webhook (SESSION_STATUS_UPDATE)
exports.handleDataWebhook = async (req, res) => {
  try {
    const { type, data, signature, consentId, dataSessionId, timestamp, success, error } = req.body;
    
    logger.info(`Received data webhook: ${type} for session: ${dataSessionId}, consent: ${consentId}`);

    // Verify webhook signature if provided
    if (signature) {
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
    }

    if (type !== 'SESSION_STATUS_UPDATE') {
      logger.error(`Invalid webhook type: ${type}`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEBHOOK_TYPE',
          message: 'Invalid webhook type'
        }
      });
    }

    // Handle error cases
    if (!success && error) {
      logger.error(`Data session error: ${error.code} - ${error.message} for session: ${dataSessionId}`);
      return res.json({
        success: true,
        message: 'Error webhook processed successfully'
      });
    }

    // Handle successful data session updates
    if (success && data) {
      const { status, fips } = data;
      
      logger.info(`Data session status update: ${dataSessionId} -> ${status}`);

      // Update account statuses based on FI status
      if (fips && Array.isArray(fips)) {
        for (const fip of fips) {
          for (const account of fip.accounts) {
            await Account.findOneAndUpdate(
              { linkRefNumber: account.linkRefNumber },
              {
                fiStatus: account.FIStatus,
                fiStatusDescription: account.description,
                lastUpdated: new Date()
              },
              { new: true }
            );
          }
        }
      }

      // If session is completed, trigger data fetch
      if (status === 'COMPLETED') {
        try {
          await setuService.fetchAndStoreData(consentId, null);
          logger.info(`Data fetched for completed session: ${dataSessionId}`);
        } catch (error) {
          logger.error(`Error fetching data for session ${dataSessionId}:`, error);
        }
      }
    }

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