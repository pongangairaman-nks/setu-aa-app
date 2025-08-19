const Consent = require('../models/Consent');
const User = require('../models/User');
const setuService = require('../services/setuService');
const logger = require('../utils/logger');

// Create consent request
exports.createConsent = async (req, res) => {
  try {
    console.log('req.body', req.body);
    const { fipId, dataLife, permissions, fetchType, frequency } = req.body;
    // Use default user ID for development when auth is disabled
    const userId = req.user?.id || 'dev-user-123';
    // Create consent request with Setu
    const setuResponse = await setuService.createConsentRequest({
      fipId,
      dataLife: dataLife || 180, // 6 months default
      permissions,
      fetchType,
      frequency
    });
    console.log('setuResponse', setuResponse);
    // Store consent in database
    const consent = new Consent({
      userId,
      consentId: setuResponse.consentId,
      fipId,
      fipName: req.body.fipName || 'Unknown FIP',
      dataLife: dataLife || 180,
      permissions,
      fetchType,
      frequency,
      status: 'PENDING',
      consentUrl: setuResponse.consentUrl,
      expiresAt: new Date(Date.now() + (dataLife || 180) * 24 * 60 * 60 * 1000)
    });

    await consent.save();

    logger.info(`Consent created for user ${userId}: ${setuResponse.consentId}`);

    res.status(201).json({
      success: true,
      data: {
        consentId: setuResponse.consentId,
        consentUrl: setuResponse.consentUrl,
        status: 'PENDING'
      }
    });
  } catch (error) {
    logger.error('Error creating consent:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONSENT_CREATION_FAILED',
        message: 'Failed to create consent request'
      }
    });
  }
};

// Get consent by ID
exports.getConsent = async (req, res) => {
  try {
    const { consentId } = req.params;
    const userId = req.user?.id || 'dev-user-123';

    const consent = await Consent.findOne({ consentId, userId });
    
    if (!consent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSENT_NOT_FOUND',
          message: 'Consent not found'
        }
      });
    }

    res.json({
      success: true,
      data: consent
    });
  } catch (error) {
    logger.error('Error fetching consent:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CONSENT_FAILED',
        message: 'Failed to fetch consent'
      }
    });
  }
};

// Get all consents for user
exports.getUserConsents = async (req, res) => {
  try {
    const userId = req.user?.id || 'dev-user-123';
    const consents = await Consent.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: consents
    });
  } catch (error) {
    logger.error('Error fetching user consents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CONSENTS_FAILED',
        message: 'Failed to fetch consents'
      }
    });
  }
};

// Update consent status
exports.updateConsentStatus = async (req, res) => {
  try {
    const { consentId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id || 'dev-user-123';

    const consent = await Consent.findOneAndUpdate(
      { consentId, userId },
      { status, lastUpdated: new Date() },
      { new: true }
    );

    if (!consent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSENT_NOT_FOUND',
          message: 'Consent not found'
        }
      });
    }

    logger.info(`Consent status updated: ${consentId} -> ${status}`);

    res.json({
      success: true,
      data: consent
    });
  } catch (error) {
    logger.error('Error updating consent status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CONSENT_FAILED',
        message: 'Failed to update consent status'
      }
    });
  }
};

// Revoke consent
exports.revokeConsent = async (req, res) => {
  try {
    const { consentId } = req.params;
    const userId = req.user?.id || 'dev-user-123';

    // Revoke consent with Setu
    await setuService.revokeConsentRequest(consentId);

    // Update consent status in database
    const consent = await Consent.findOneAndUpdate(
      { consentId, userId },
      { status: 'REVOKED', lastUpdated: new Date() },
      { new: true }
    );

    if (!consent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSENT_NOT_FOUND',
          message: 'Consent not found'
        }
      });
    }

    logger.info(`Consent revoked: ${consentId}`);

    res.json({
      success: true,
      message: 'Consent revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking consent:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REVOKE_CONSENT_FAILED',
        message: 'Failed to revoke consent'
      }
    });
  }
};

// Get consent status
exports.getConsentStatus = async (req, res) => {
  try {
    const { consentId } = req.params;
    const userId = req.user?.id || 'dev-user-123';

    const consent = await Consent.findOne({ consentId, userId });
    
    if (!consent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSENT_NOT_FOUND',
          message: 'Consent not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        consentId: consent.consentId,
        status: consent.status,
        lastUpdated: consent.lastUpdated
      }
    });
  } catch (error) {
    logger.error('Error fetching consent status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STATUS_FAILED',
        message: 'Failed to fetch consent status'
      }
    });
  }
}; 

// Consent callback endpoint - handles redirect from Setu
exports.consentCallback = async (req, res) => {
  console.log('req.query', req.query);
  try {
    const { id:consentId, success: status, error } = req.query;
    
    logger.info(`Consent callback received - ConsentId: ${consentId}, Status: ${status}, Error: ${error}`);

    // Update consent status in database if consentId is provided
    if (consentId) {
      const consent = await Consent.findOneAndUpdate(
        { consentId },
        { 
          status: status || 'COMPLETED',
          lastUpdated: new Date(),
          callbackReceived: true
        },
        { new: true }
      );

      if (consent) {
        logger.info(`Consent status updated in database: ${consentId} -> ${status}`);
      }

      // Update user's consent details
      try {
        // Find user by consent ID and update their consent details
        const user = await User.findOneAndUpdate(
          { 'consentDetails.consentId': consentId },
          {
            'consentDetails.consentStatus': status === "true" ? "APPROVED" : "REJECTED",
            'consentDetails.consentUpdatedAt': new Date()
          },
          { new: true }
        );

        if (user) {
          logger.info(`User consent details updated: ${user.email} -> ${status === "true" ? "APPROVED" : "REJECTED"}`);
        } else {
          logger.warn(`No user found with consent ID: ${consentId}`);
        }
      } catch (error) {
        logger.error('Error updating user consent details:', error);
      }
    }

    // Create the mobile app deep link with parameters
    const mobileAppUrl = `setu-aa-app://consent-callback?consentId=${consentId || ''}&status=${status || 'unknown'}&error=${error || ''}`;
    
    // Redirect to mobile app
    res.redirect(mobileAppUrl);
    
  } catch (error) {
    logger.error('Error in consent callback:', error);
    
    // Even if there's an error, try to redirect to mobile app with error status
    const mobileAppUrl = `setu-aa-app://consent-callback?error=callback_error&message=${encodeURIComponent(error.message)}`;
    res.redirect(mobileAppUrl);
  }
}; 