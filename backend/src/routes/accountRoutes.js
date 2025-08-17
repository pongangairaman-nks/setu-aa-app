const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Fetch accounts from Setu
router.post('/fetch',
  validationMiddleware.validateDataFetch,
  accountsController.fetchAccounts
);

// Get all accounts for user
router.get('/', accountsController.getUserAccounts);

// Get account by ID
router.get('/:accountId',
  validationMiddleware.validateAccountId,
  accountsController.getAccount
);

// Update account balance
router.patch('/:accountId/balance',
  validationMiddleware.validateAccountId,
  validationMiddleware.validateBalanceUpdate,
  accountsController.updateAccountBalance
);

// Get account summary
router.get('/summary', accountsController.getAccountSummary);

// Refresh all accounts for user
router.post('/refresh', accountsController.refreshAccounts);

module.exports = router; 