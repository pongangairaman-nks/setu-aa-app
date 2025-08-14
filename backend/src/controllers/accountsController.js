const Account = require('../models/Account');
const setuService = require('../services/setuService');
const logger = require('../utils/logger');

// Fetch accounts from Setu
exports.fetchAccounts = async (req, res) => {
  try {
    const { consentId, dataRange } = req.body;
    const userId = req.user.id;

    // Fetch accounts from Setu
    const setuResponse = await setuService.fetchAccounts({
      consentId,
      dataRange
    });

    // Store accounts in database
    const accounts = [];
    for (const accountData of setuResponse.accounts) {
      const account = new Account({
        userId,
        consentId,
        accountId: accountData.accountId,
        accountName: accountData.accountName,
        accountNumber: accountData.accountNumber,
        bankName: accountData.bankName,
        accountType: accountData.accountType,
        balance: accountData.balance,
        status: accountData.status,
        lastFetched: new Date()
      });
      
      await account.save();
      accounts.push(account);
    }

    logger.info(`Accounts fetched for user ${userId}: ${accounts.length} accounts`);

    res.json({
      success: true,
      data: {
        accounts: accounts,
        totalCount: accounts.length
      }
    });
  } catch (error) {
    logger.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ACCOUNTS_FAILED',
        message: 'Failed to fetch accounts'
      }
    });
  }
};

// Get all accounts for user
exports.getUserAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await Account.find({ userId }).sort({ lastFetched: -1 });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    logger.error('Error fetching user accounts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USER_ACCOUNTS_FAILED',
        message: 'Failed to fetch user accounts'
      }
    });
  }
};

// Get account by ID
exports.getAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.id;

    const account = await Account.findOne({ accountId, userId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Account not found'
        }
      });
    }

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    logger.error('Error fetching account:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ACCOUNT_FAILED',
        message: 'Failed to fetch account'
      }
    });
  }
};

// Update account balance
exports.updateAccountBalance = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { balance } = req.body;
    const userId = req.user.id;

    const account = await Account.findOneAndUpdate(
      { accountId, userId },
      { 
        balance, 
        lastUpdated: new Date(),
        lastFetched: new Date()
      },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Account not found'
        }
      });
    }

    logger.info(`Account balance updated: ${accountId} -> ${balance}`);

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    logger.error('Error updating account balance:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ACCOUNT_FAILED',
        message: 'Failed to update account balance'
      }
    });
  }
};

// Get account summary
exports.getAccountSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const summary = await Account.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAccounts: { $sum: 1 },
          activeAccounts: {
            $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
          },
          totalBalance: { $sum: '$balance' },
          averageBalance: { $avg: '$balance' }
        }
      }
    ]);

    const result = summary[0] || {
      totalAccounts: 0,
      activeAccounts: 0,
      totalBalance: 0,
      averageBalance: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching account summary:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_SUMMARY_FAILED',
        message: 'Failed to fetch account summary'
      }
    });
  }
};

// Refresh all accounts for user
exports.refreshAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's active consents
    const Consent = require('../models/Consent');
    const activeConsents = await Consent.find({ 
      userId, 
      status: 'ACTIVE',
      expiresAt: { $gt: new Date() }
    });

    if (activeConsents.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_ACTIVE_CONSENTS',
          message: 'No active consents found'
        }
      });
    }

    const refreshedAccounts = [];
    
    // Refresh accounts for each active consent
    for (const consent of activeConsents) {
      try {
        const dataRange = {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          to: new Date().toISOString()
        };

        const setuResponse = await setuService.fetchAccounts({
          consentId: consent.consentId,
          dataRange
        });

        // Update existing accounts or create new ones
        for (const accountData of setuResponse.accounts) {
          const account = await Account.findOneAndUpdate(
            { accountId: accountData.accountId, userId },
            {
              accountName: accountData.accountName,
              accountNumber: accountData.accountNumber,
              bankName: accountData.bankName,
              accountType: accountData.accountType,
              balance: accountData.balance,
              status: accountData.status,
              lastFetched: new Date(),
              lastUpdated: new Date()
            },
            { 
              upsert: true, 
              new: true,
              setDefaultsOnInsert: true
            }
          );
          
          refreshedAccounts.push(account);
        }
      } catch (error) {
        logger.error(`Error refreshing accounts for consent ${consent.consentId}:`, error);
      }
    }

    logger.info(`Accounts refreshed for user ${userId}: ${refreshedAccounts.length} accounts`);

    res.json({
      success: true,
      data: {
        accounts: refreshedAccounts,
        totalCount: refreshedAccounts.length
      }
    });
  } catch (error) {
    logger.error('Error refreshing accounts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_ACCOUNTS_FAILED',
        message: 'Failed to refresh accounts'
      }
    });
  }
}; 