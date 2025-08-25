const crypto = require('crypto');
const logger = require('../utils/logger');
const Consent = require('../models/Consent');
const EnhancedAccount = require('../models/EnhancedAccount');
const Transaction = require('../models/Transaction');
const setuService = require('./setuService');
const { COMPLIANCE_CONFIG } = require('../../src/config/compliance');
const { FINANCIAL_DATA_TYPES } = require('../../src/config/financialDataTypes');

class EnhancedConsentService {
  constructor() {
    this.notificationService = null; // Will be injected
    this.auditService = null; // Will be injected
  }

  // Create consent with enhanced validation and compliance
  async createConsent(consentData) {
    try {
      logger.info('Creating enhanced consent with compliance validation');

      // Validate consent data
      const validationResult = this.validateConsentData(consentData);
      if (!validationResult.isValid) {
        throw new Error(`Consent validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Check for existing active consents
      const existingConsent = await this.checkExistingConsent(consentData.userId, consentData.fipId);
      if (existingConsent) {
        logger.warn(`Active consent already exists for user ${consentData.userId} and FIP ${consentData.fipId}`);
        return existingConsent;
      }

      // Create consent request with Setu
      const setuConsentData = this.prepareSetuConsentData(consentData);
      const setuResponse = await setuService.createConsentRequest(setuConsentData);

      // Create consent record in database
      const consent = new Consent({
        userId: consentData.userId,
        consentId: setuResponse.consentId,
        fipId: consentData.fipId,
        fipName: consentData.fipName,
        dataLife: consentData.dataLife || COMPLIANCE_CONFIG.DATA_RETENTION.MANDATORY_PERIODS.TRANSACTION_DATA,
        permissions: consentData.permissions,
        fetchType: consentData.fetchType,
        frequency: consentData.frequency,
        consentUrl: setuResponse.consentUrl,
        expiresAt: new Date(Date.now() + (consentData.dataLife || 180) * 24 * 60 * 60 * 1000)
      });

      await consent.save();

      // Log audit trail
      await this.logAuditEvent('consent_creation', {
        userId: consentData.userId,
        consentId: setuResponse.consentId,
        fipId: consentData.fipId,
        permissions: consentData.permissions
      });

      // Send notification
      await this.sendConsentNotification('creation', consent);

      logger.info(`Consent created successfully: ${setuResponse.consentId}`);
      
      return {
        consentId: setuResponse.consentId,
        consentUrl: setuResponse.consentUrl,
        status: 'PENDING',
        expiresAt: consent.expiresAt,
        dataLife: consent.dataLife
      };
    } catch (error) {
      logger.error('Error creating enhanced consent:', error);
      throw error;
    }
  }

  // Validate consent data against compliance requirements
  validateConsentData(consentData) {
    const errors = [];

    // Check required fields
    if (!consentData.userId) errors.push('userId is required');
    if (!consentData.fipId) errors.push('fipId is required');
    if (!consentData.permissions || consentData.permissions.length === 0) {
      errors.push('permissions are required');
    }

    // Validate permissions
    const validPermissions = ['ACCOUNT', 'TRANSACTIONS', 'PROFILE', 'STATEMENTS'];
    for (const permission of consentData.permissions) {
      if (!validPermissions.includes(permission)) {
        errors.push(`Invalid permission: ${permission}`);
      }
    }

    // Validate data life
    const minDataLife = 1;
    const maxDataLife = 365;
    if (consentData.dataLife && (consentData.dataLife < minDataLife || consentData.dataLife > maxDataLife)) {
      errors.push(`Data life must be between ${minDataLife} and ${maxDataLife} days`);
    }

    // Validate frequency
    if (consentData.frequency) {
      const validUnits = ['MONTH', 'DAY', 'WEEK'];
      if (!validUnits.includes(consentData.frequency.unit)) {
        errors.push(`Invalid frequency unit: ${consentData.frequency.unit}`);
      }
      if (consentData.frequency.value < 1) {
        errors.push('Frequency value must be at least 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check for existing active consent
  async checkExistingConsent(userId, fipId) {
    const existingConsent = await Consent.findOne({
      userId,
      fipId,
      status: 'ACTIVE',
      expiresAt: { $gt: new Date() }
    });

    return existingConsent;
  }

  // Prepare consent data for Setu API
  prepareSetuConsentData(consentData) {
    return {
      customerId: consentData.userId,
      dataLife: consentData.dataLife || 180,
      permissions: consentData.permissions,
      fetchType: consentData.fetchType || 'PERIODIC',
      frequency: consentData.frequency || {
        unit: 'MONTH',
        value: 1
      },
      dataFilter: consentData.dataFilter || []
    };
  }

  // Handle consent status updates from webhook
  async handleConsentStatusUpdate(consentId, status, additionalData = {}) {
    try {
      logger.info(`Handling consent status update: ${consentId} -> ${status}`);

      const consent = await Consent.findOne({ consentId });
      if (!consent) {
        throw new Error(`Consent not found: ${consentId}`);
      }

      const previousStatus = consent.status;
      consent.status = status;
      consent.lastUpdated = new Date();

      // Handle specific status updates
      switch (status) {
        case 'ACTIVE':
          await this.handleConsentActivation(consent, additionalData);
          break;
        case 'EXPIRED':
          await this.handleConsentExpiry(consent);
          break;
        case 'REVOKED':
          await this.handleConsentRevocation(consent);
          break;
        case 'REJECTED':
          await this.handleConsentRejection(consent, additionalData);
          break;
      }

      await consent.save();

      // Log audit trail
      await this.logAuditEvent('consent_status_update', {
        consentId,
        previousStatus,
        newStatus: status,
        userId: consent.userId
      });

      // Send notification
      await this.sendConsentNotification('status_update', consent, { previousStatus });

      logger.info(`Consent status updated successfully: ${consentId} -> ${status}`);
    } catch (error) {
      logger.error('Error handling consent status update:', error);
      throw error;
    }
  }

  // Handle consent activation
  async handleConsentActivation(consent, additionalData) {
    logger.info(`Handling consent activation: ${consent.consentId}`);

    // Fetch initial data
    try {
      await setuService.fetchAndStoreData(consent.consentId, consent.userId);
      logger.info(`Initial data fetched for consent: ${consent.consentId}`);
    } catch (error) {
      logger.error(`Error fetching initial data for consent ${consent.consentId}:`, error);
      // Don't fail the activation, just log the error
    }

    // Schedule periodic data fetch if needed
    if (consent.fetchType === 'PERIODIC') {
      await this.schedulePeriodicDataFetch(consent);
    }

    // Schedule expiry notifications
    await this.scheduleExpiryNotifications(consent);
  }

  // Handle consent expiry
  async handleConsentExpiry(consent) {
    logger.info(`Handling consent expiry: ${consent.consentId}`);

    // Mark related accounts as inactive
    await EnhancedAccount.updateMany(
      { consentId: consent.consentId },
      { status: 'INACTIVE' }
    );

    // Schedule data deletion after grace period
    const gracePeriod = COMPLIANCE_CONFIG.CONSENT_MANAGEMENT.EXPIRY_HANDLING.GRACE_PERIOD;
    setTimeout(async () => {
      await this.deleteExpiredData(consent.consentId);
    }, gracePeriod * 24 * 60 * 60 * 1000);
  }

  // Handle consent revocation
  async handleConsentRevocation(consent) {
    logger.info(`Handling consent revocation: ${consent.consentId}`);

    // Immediately delete all related data
    await this.deleteConsentData(consent.consentId);

    // Revoke consent with Setu
    try {
      await setuService.revokeConsentRequest(consent.consentId);
    } catch (error) {
      logger.error(`Error revoking consent with Setu: ${consent.consentId}`, error);
    }
  }

  // Handle consent rejection
  async handleConsentRejection(consent, additionalData) {
    logger.info(`Handling consent rejection: ${consent.consentId}`);

    // Log rejection reason
    if (additionalData.reason) {
      await this.logAuditEvent('consent_rejection', {
        consentId: consent.consentId,
        userId: consent.userId,
        reason: additionalData.reason
      });
    }
  }

  // Schedule periodic data fetch
  async schedulePeriodicDataFetch(consent) {
    if (!consent.frequency) return;

    const intervalMs = this.calculateIntervalMs(consent.frequency);
    
    setInterval(async () => {
      try {
        await setuService.fetchAndStoreData(consent.consentId, consent.userId);
        logger.info(`Periodic data fetch completed for consent: ${consent.consentId}`);
      } catch (error) {
        logger.error(`Error in periodic data fetch for consent ${consent.consentId}:`, error);
      }
    }, intervalMs);
  }

  // Calculate interval in milliseconds
  calculateIntervalMs(frequency) {
    const { unit, value } = frequency;
    const multipliers = {
      'DAY': 24 * 60 * 60 * 1000,
      'WEEK': 7 * 24 * 60 * 60 * 1000,
      'MONTH': 30 * 24 * 60 * 60 * 1000
    };
    return multipliers[unit] * value;
  }

  // Schedule expiry notifications
  async scheduleExpiryNotifications(consent) {
    const notificationDays = COMPLIANCE_CONFIG.CONSENT_MANAGEMENT.EXPIRY_HANDLING.NOTIFICATION_DAYS;
    
    for (const days of notificationDays) {
      const notificationTime = new Date(consent.expiresAt.getTime() - (days * 24 * 60 * 60 * 1000));
      const delay = notificationTime.getTime() - Date.now();
      
      if (delay > 0) {
        setTimeout(async () => {
          await this.sendConsentNotification('expiry_warning', consent, { daysUntilExpiry: days });
        }, delay);
      }
    }
  }

  // Delete expired data
  async deleteExpiredData(consentId) {
    try {
      logger.info(`Deleting expired data for consent: ${consentId}`);

      // Delete accounts
      const deletedAccounts = await EnhancedAccount.deleteMany({ consentId });
      
      // Delete transactions
      const deletedTransactions = await Transaction.deleteMany({ consentId });

      // Log audit trail
      await this.logAuditEvent('data_deletion', {
        consentId,
        deletedAccounts: deletedAccounts.deletedCount,
        deletedTransactions: deletedTransactions.deletedCount
      });

      logger.info(`Expired data deleted for consent ${consentId}: ${deletedAccounts.deletedCount} accounts, ${deletedTransactions.deletedCount} transactions`);
    } catch (error) {
      logger.error(`Error deleting expired data for consent ${consentId}:`, error);
    }
  }

  // Delete all consent data
  async deleteConsentData(consentId) {
    try {
      logger.info(`Deleting all data for consent: ${consentId}`);

      // Delete accounts
      const deletedAccounts = await EnhancedAccount.deleteMany({ consentId });
      
      // Delete transactions
      const deletedTransactions = await Transaction.deleteMany({ consentId });

      // Log audit trail
      await this.logAuditEvent('consent_data_deletion', {
        consentId,
        deletedAccounts: deletedAccounts.deletedCount,
        deletedTransactions: deletedTransactions.deletedCount
      });

      logger.info(`All data deleted for consent ${consentId}: ${deletedAccounts.deletedCount} accounts, ${deletedTransactions.deletedCount} transactions`);
    } catch (error) {
      logger.error(`Error deleting consent data ${consentId}:`, error);
    }
  }

  // Get consent status
  async getConsentStatus(consentId) {
    try {
      const consent = await Consent.findOne({ consentId });
      if (!consent) {
        throw new Error(`Consent not found: ${consentId}`);
      }

      return {
        consentId: consent.consentId,
        status: consent.status,
        lastUpdated: consent.lastUpdated,
        expiresAt: consent.expiresAt,
        dataLife: consent.dataLife,
        permissions: consent.permissions,
        fipName: consent.fipName
      };
    } catch (error) {
      logger.error('Error getting consent status:', error);
      throw error;
    }
  }

  // Get user consents
  async getUserConsents(userId, options = {}) {
    try {
      const query = { userId };
      
      if (options.status) query.status = options.status;
      if (options.fipId) query.fipId = options.fipId;

      const consents = await Consent.find(query).sort({ createdAt: -1 });
      
      return consents.map(consent => ({
        consentId: consent.consentId,
        status: consent.status,
        fipName: consent.fipName,
        permissions: consent.permissions,
        expiresAt: consent.expiresAt,
        dataLife: consent.dataLife,
        createdAt: consent.createdAt,
        lastUpdated: consent.lastUpdated
      }));
    } catch (error) {
      logger.error('Error getting user consents:', error);
      throw error;
    }
  }

  // Revoke consent
  async revokeConsent(consentId, userId) {
    try {
      logger.info(`Revoking consent: ${consentId} by user: ${userId}`);

      const consent = await Consent.findOne({ consentId, userId });
      if (!consent) {
        throw new Error(`Consent not found: ${consentId}`);
      }

      if (consent.status !== 'ACTIVE') {
        throw new Error(`Cannot revoke consent with status: ${consent.status}`);
      }

      // Update consent status
      consent.status = 'REVOKED';
      consent.lastUpdated = new Date();
      await consent.save();

      // Delete all related data
      await this.deleteConsentData(consentId);

      // Revoke with Setu
      try {
        await setuService.revokeConsentRequest(consentId);
      } catch (error) {
        logger.error(`Error revoking consent with Setu: ${consentId}`, error);
      }

      // Log audit trail
      await this.logAuditEvent('consent_revocation', {
        consentId,
        userId,
        revokedBy: userId
      });

      // Send notification
      await this.sendConsentNotification('revocation', consent);

      logger.info(`Consent revoked successfully: ${consentId}`);
      return true;
    } catch (error) {
      logger.error('Error revoking consent:', error);
      throw error;
    }
  }

  // Log audit event
  async logAuditEvent(event, data) {
    if (this.auditService) {
      await this.auditService.logEvent(event, data);
    } else {
      logger.info(`Audit event: ${event}`, data);
    }
  }

  // Send consent notification
  async sendConsentNotification(type, consent, additionalData = {}) {
    if (this.notificationService) {
      await this.notificationService.sendConsentNotification(type, consent, additionalData);
    } else {
      logger.info(`Consent notification: ${type} for consent ${consent.consentId}`);
    }
  }

  // Clean up expired consents (cron job)
  async cleanupExpiredConsents() {
    try {
      logger.info('Starting expired consent cleanup');

      const expiredConsents = await Consent.findExpiredConsents();
      
      for (const consent of expiredConsents) {
        await this.handleConsentStatusUpdate(consent.consentId, 'EXPIRED');
      }

      logger.info(`Expired consent cleanup completed: ${expiredConsents.length} consents processed`);
    } catch (error) {
      logger.error('Error in expired consent cleanup:', error);
    }
  }

  // Get consent analytics
  async getConsentAnalytics(userId) {
    try {
      const analytics = await Consent.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalConsents: { $sum: 1 },
            activeConsents: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$status', 'ACTIVE'] },
                      { $gt: ['$expiresAt', new Date()] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            expiredConsents: {
              $sum: {
                $cond: [
                  { $lte: ['$expiresAt', new Date()] },
                  1,
                  0
                ]
              }
            },
            revokedConsents: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'REVOKED'] },
                  1,
                  0
                ]
              }
            },
            averageDataLife: { $avg: '$dataLife' }
          }
        }
      ]);

      return analytics[0] || {
        totalConsents: 0,
        activeConsents: 0,
        expiredConsents: 0,
        revokedConsents: 0,
        averageDataLife: 0
      };
    } catch (error) {
      logger.error('Error getting consent analytics:', error);
      throw error;
    }
  }
}

module.exports = new EnhancedConsentService();
