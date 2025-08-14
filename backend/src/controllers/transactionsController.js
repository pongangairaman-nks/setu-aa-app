const Transaction = require('../models/Transaction');
const setuService = require('../services/setuService');
const logger = require('../utils/logger');

// Fetch transactions from Setu
exports.fetchTransactions = async (req, res) => {
  try {
    const { accountId, consentId, dataRange } = req.body;
    const userId = req.user.id;

    // Fetch transactions from Setu
    const setuResponse = await setuService.fetchTransactions({
      accountId,
      consentId,
      dataRange
    });

    // Store transactions in database
    const transactions = [];
    for (const transactionData of setuResponse.transactions) {
      const transaction = new Transaction({
        userId,
        accountId,
        consentId,
        transactionId: transactionData.transactionId,
        description: transactionData.description,
        amount: transactionData.amount,
        transactionType: transactionData.transactionType,
        transactionDate: new Date(transactionData.transactionDate),
        balance: transactionData.balance,
        status: transactionData.status,
        category: transactionData.category,
        merchantName: transactionData.merchantName,
        referenceNumber: transactionData.referenceNumber,
        lastFetched: new Date()
      });
      
      await transaction.save();
      transactions.push(transaction);
    }

    logger.info(`Transactions fetched for user ${userId}, account ${accountId}: ${transactions.length} transactions`);

    res.json({
      success: true,
      data: {
        transactions: transactions,
        totalCount: transactions.length
      }
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TRANSACTIONS_FAILED',
        message: 'Failed to fetch transactions'
      }
    });
  }
};

// Get transactions for user
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId, page = 1, limit = 50, fromDate, toDate, type } = req.query;

    const filter = { userId };
    
    if (accountId) filter.accountId = accountId;
    if (type) filter.transactionType = type;
    if (fromDate || toDate) {
      filter.transactionDate = {};
      if (fromDate) filter.transactionDate.$gte = new Date(fromDate);
      if (toDate) filter.transactionDate.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find(filter)
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USER_TRANSACTIONS_FAILED',
        message: 'Failed to fetch user transactions'
      }
    });
  }
};

// Get transaction by ID
exports.getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({ transactionId, userId });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: 'Transaction not found'
        }
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TRANSACTION_FAILED',
        message: 'Failed to fetch transaction'
      }
    });
  }
};

// Get transaction summary
exports.getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, accountId } = req.query;

    const filter = { userId };
    
    if (fromDate || toDate) {
      filter.transactionDate = {};
      if (fromDate) filter.transactionDate.$gte = new Date(fromDate);
      if (toDate) filter.transactionDate.$lte = new Date(toDate);
    }
    
    if (accountId) filter.accountId = accountId;

    const summary = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalCredit: {
            $sum: {
              $cond: [{ $eq: ['$transactionType', 'CREDIT'] }, '$amount', 0]
            }
          },
          totalDebit: {
            $sum: {
              $cond: [{ $eq: ['$transactionType', 'DEBIT'] }, '$amount', 0]
            }
          },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const result = summary[0] || {
      totalTransactions: 0,
      totalCredit: 0,
      totalDebit: 0,
      averageAmount: 0
    };

    result.netAmount = result.totalCredit - result.totalDebit;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching transaction summary:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TRANSACTION_SUMMARY_FAILED',
        message: 'Failed to fetch transaction summary'
      }
    });
  }
};

// Get transactions by category
exports.getTransactionsByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate } = req.query;

    const filter = { userId };
    
    if (fromDate || toDate) {
      filter.transactionDate = {};
      if (fromDate) filter.transactionDate.$gte = new Date(fromDate);
      if (toDate) filter.transactionDate.$lte = new Date(toDate);
    }

    const categories = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error fetching transactions by category:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CATEGORY_TRANSACTIONS_FAILED',
        message: 'Failed to fetch transactions by category'
      }
    });
  }
};

// Refresh transactions for all accounts
exports.refreshTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.body;
    
    // Get user's accounts
    const Account = require('../models/Account');
    const accounts = await Account.find({ userId });

    if (accounts.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_ACCOUNTS_FOUND',
          message: 'No accounts found for user'
        }
      });
    }

    const refreshedTransactions = [];
    
    // Refresh transactions for each account
    for (const account of accounts) {
      try {
        const dataRange = {
          from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        };

        const setuResponse = await setuService.fetchTransactions({
          accountId: account.accountId,
          consentId: account.consentId,
          dataRange
        });

        // Update existing transactions or create new ones
        for (const transactionData of setuResponse.transactions) {
          const transaction = await Transaction.findOneAndUpdate(
            { transactionId: transactionData.transactionId, userId },
            {
              accountId: account.accountId,
              consentId: account.consentId,
              description: transactionData.description,
              amount: transactionData.amount,
              transactionType: transactionData.transactionType,
              transactionDate: new Date(transactionData.transactionDate),
              balance: transactionData.balance,
              status: transactionData.status,
              category: transactionData.category,
              merchantName: transactionData.merchantName,
              referenceNumber: transactionData.referenceNumber,
              lastFetched: new Date(),
              lastUpdated: new Date()
            },
            { 
              upsert: true, 
              new: true,
              setDefaultsOnInsert: true
            }
          );
          
          refreshedTransactions.push(transaction);
        }
      } catch (error) {
        logger.error(`Error refreshing transactions for account ${account.accountId}:`, error);
      }
    }

    logger.info(`Transactions refreshed for user ${userId}: ${refreshedTransactions.length} transactions`);

    res.json({
      success: true,
      data: {
        transactions: refreshedTransactions,
        totalCount: refreshedTransactions.length
      }
    });
  } catch (error) {
    logger.error('Error refreshing transactions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_TRANSACTIONS_FAILED',
        message: 'Failed to refresh transactions'
      }
    });
  }
}; 