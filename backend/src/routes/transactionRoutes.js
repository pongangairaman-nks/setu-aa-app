const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Fetch transactions from Setu
router.post('/fetch',
  validationMiddleware.validateDataFetch,
  transactionsController.fetchTransactions
);

// Get transactions for user
router.get('/', transactionsController.getUserTransactions);

// Get transaction by ID
router.get('/:transactionId',
  validationMiddleware.validateTransactionId,
  transactionsController.getTransaction
);

// Get transaction summary
router.get('/summary', transactionsController.getTransactionSummary);

// Get transactions by category
router.get('/category', transactionsController.getTransactionsByCategory);

// Refresh transactions for all accounts
router.post('/refresh', transactionsController.refreshTransactions);

module.exports = router; 