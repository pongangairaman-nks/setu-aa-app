const Consent = require('../models/Consent');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const logger = require('./logger');

class DataCleanupService {
  constructor() {
    this.cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.dataRetentionDays = 180; // 6 months
  }

  // Start the cleanup scheduler
  startCleanupScheduler() {
    logger.info('Starting data cleanup scheduler');
    
    // Run cleanup immediately
    this.performCleanup();
    
    // Schedule regular cleanup
    setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
  }

  // Perform data cleanup
  async performCleanup() {
    try {
      logger.info('Starting data cleanup process');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.dataRetentionDays);
      
      // Clean up expired consents
      await this.cleanupExpiredConsents(cutoffDate);
      
      // Clean up old accounts
      await this.cleanupOldAccounts(cutoffDate);
      
      // Clean up old transactions
      await this.cleanupOldTransactions(cutoffDate);
      
      // Clean up inactive users
      await this.cleanupInactiveUsers(cutoffDate);
      
      logger.info('Data cleanup process completed');
    } catch (error) {
      logger.error('Error during data cleanup:', error);
    }
  }

  // Clean up expired consents
  async cleanupExpiredConsents(cutoffDate) {
    try {
      const result = await Consent.deleteMany({
        createdAt: { $lt: cutoffDate },
        status: { $in: ['EXPIRED', 'REVOKED', 'REJECTED'] }
      });
      
      if (result.deletedCount > 0) {
        logger.info(`Cleaned up ${result.deletedCount} expired consents`);
      }
    } catch (error) {
      logger.error('Error cleaning up expired consents:', error);
    }
  }

  // Clean up old accounts
  async cleanupOldAccounts(cutoffDate) {
    try {
      const result = await Account.deleteMany({
        createdAt: { $lt: cutoffDate }
      });
      
      if (result.deletedCount > 0) {
        logger.info(`Cleaned up ${result.deletedCount} old accounts`);
      }
    } catch (error) {
      logger.error('Error cleaning up old accounts:', error);
    }
  }

  // Clean up old transactions
  async cleanupOldTransactions(cutoffDate) {
    try {
      const result = await Transaction.deleteMany({
        createdAt: { $lt: cutoffDate }
      });
      
      if (result.deletedCount > 0) {
        logger.info(`Cleaned up ${result.deletedCount} old transactions`);
      }
    } catch (error) {
      logger.error('Error cleaning up old transactions:', error);
    }
  }

  // Clean up inactive users
  async cleanupInactiveUsers(cutoffDate) {
    try {
      const result = await User.deleteMany({
        lastActivityAt: { $lt: cutoffDate },
        isActive: false
      });
      
      if (result.deletedCount > 0) {
        logger.info(`Cleaned up ${result.deletedCount} inactive users`);
      }
    } catch (error) {
      logger.error('Error cleaning up inactive users:', error);
    }
  }

  // Manual cleanup for specific user
  async cleanupUserData(userId) {
    try {
      logger.info(`Starting manual cleanup for user: ${userId}`);
      
      // Delete user's consents
      const consentResult = await Consent.deleteMany({ userId });
      logger.info(`Deleted ${consentResult.deletedCount} consents for user ${userId}`);
      
      // Delete user's accounts
      const accountResult = await Account.deleteMany({ userId });
      logger.info(`Deleted ${accountResult.deletedCount} accounts for user ${userId}`);
      
      // Delete user's transactions
      const transactionResult = await Transaction.deleteMany({ userId });
      logger.info(`Deleted ${transactionResult.deletedCount} transactions for user ${userId}`);
      
      // Delete user
      const userResult = await User.deleteOne({ _id: userId });
      if (userResult.deletedCount > 0) {
        logger.info(`Deleted user ${userId}`);
      }
      
      logger.info(`Manual cleanup completed for user: ${userId}`);
    } catch (error) {
      logger.error(`Error during manual cleanup for user ${userId}:`, error);
      throw error;
    }
  }

  // Get cleanup statistics
  async getCleanupStats() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.dataRetentionDays);
      
      const stats = {
        expiredConsents: await Consent.countDocuments({
          createdAt: { $lt: cutoffDate },
          status: { $in: ['EXPIRED', 'REVOKED', 'REJECTED'] }
        }),
        oldAccounts: await Account.countDocuments({
          createdAt: { $lt: cutoffDate }
        }),
        oldTransactions: await Transaction.countDocuments({
          createdAt: { $lt: cutoffDate }
        }),
        inactiveUsers: await User.countDocuments({
          lastActivityAt: { $lt: cutoffDate },
          isActive: false
        }),
        totalUsers: await User.countDocuments(),
        totalConsents: await Consent.countDocuments(),
        totalAccounts: await Account.countDocuments(),
        totalTransactions: await Transaction.countDocuments()
      };
      
      return stats;
    } catch (error) {
      logger.error('Error getting cleanup stats:', error);
      throw error;
    }
  }

  // Force cleanup for testing
  async forceCleanup() {
    logger.info('Force cleanup initiated');
    await this.performCleanup();
  }
}

module.exports = new DataCleanupService(); 