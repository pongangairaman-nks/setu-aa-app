const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

class SetuService {
  constructor() {
    this.baseURL = process.env.SETU_BASE_URL || 'https://fiu-uat.setu.co';
    this.clientId = process.env.SETU_CLIENT_ID;
    this.clientSecret = process.env.SETU_CLIENT_SECRET;
    this.privateKey = this.formatPrivateKey(process.env.SETU_PRIVATE_KEY?.replace(/\\n/g, '\n'));
    this.publicKey = process.env.SETU_PUBLIC_KEY?.replace(/\\n/g, '\n');
    this.aaHandle = process.env.SETU_AA_HANDLE;
    this.productId = process.env.SETU_PRODUCT_ID;
  }

  // Format private key to handle newlines properly
  formatPrivateKey(privateKey) {
    if (!privateKey) return null;
    
    // If the key already contains newlines, return as is
    if (privateKey.includes('\n')) {
      return privateKey;
    }
    
    // If it's a single line, we need to reconstruct the proper format
    // This assumes the key is stored as a single line with \n placeholders
    return privateKey.replace(/\\n/g, '\n');
  }

  // Generate JWT token for Setu API authentication
  generateJWT() {
    // Debug logging
    console.log('Setu Service Config:', {
      baseURL: this.baseURL,
      clientId: this.clientId,
      clientSecret: this.clientSecret ? 'Set' : 'Not set',
      privateKey: this.privateKey ? 'Set' : 'Not set',
      publicKey: this.publicKey ? 'Set' : 'Not set',
      aaHandle: this.aaHandle,
      productId: this.productId
    });

    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.clientId,
      sub: this.clientId,
      aud: this.baseURL,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      jti: crypto.randomBytes(16).toString('hex'),
      productId: this.productId
    };

    // Validate required credentials
    if (!this.clientId) {
      throw new Error('SETU_CLIENT_ID is not configured');
    }
    if (!this.privateKey) {
      throw new Error('SETU_PRIVATE_KEY is not configured');
    }
    if (!this.productId) {
      throw new Error('SETU_PRODUCT_ID is not configured');
    }

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${encodedHeader}.${encodedPayload}`);
    const signature = sign.sign(this.privateKey, 'base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Create HTTP client with authentication
  async createAuthenticatedClient() {
    const token = this.generateJWT();
    
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'x-client-secret': this.clientSecret
      },
      timeout: 30000
    });
  }

  // Create consent request
  async createConsentRequest(consentData) {
    try {
      const client = await this.createAuthenticatedClient();
      
      const payload = {
        Detail: {
          consentStart: new Date().toISOString(),
          consentExpiry: new Date(Date.now() + (consentData.dataLife || 180) * 24 * 60 * 60 * 1000).toISOString(),
          Customer: {
            id: consentData.customerId || 'customer@setu.co'
          },
          FITypes: consentData.permissions || ['ACCOUNT', 'TRANSACTIONS'],
          consentMode: 'STORE',
          fetchType: consentData.fetchType || 'PERIODIC',
          Frequency: {
            unit: consentData.frequency?.unit || 'MONTH',
            value: consentData.frequency?.value || 1
          },
          dataLife: {
            unit: 'DAY',
            value: consentData.dataLife || 180
          },
          dataConsumer: {
            id: this.aaHandle
          },
          purpose: {
            code: '101',
            refUri: 'https://api.rebit.org.in/consent/purpose/101.xml',
            text: 'Wealth management service',
            Category: {
              type: 'string',
              enum: ['string']
            }
          },
          dataFilter: consentData.dataFilter || [],
          dataErase: new Date(Date.now() + (consentData.dataLife || 180) * 24 * 60 * 60 * 1000).toISOString(),
          dataFetch: {
            frequency: {
              unit: consentData.frequency?.unit || 'MONTH',
              value: consentData.frequency?.value || 1
            }
          }
        },
        context: [
          {
            key: 'sessionId',
            value: crypto.randomBytes(16).toString('hex')
          }
        ]
      };

      const response = await client.post('/consents', payload);
      
      logger.info('Consent request created successfully');
      
      return {
        consentId: response.data.consentId,
        consentUrl: response.data.url,
        status: 'PENDING'
      };
    } catch (error) {
      logger.error('Error creating consent request:', error.response?.data || error.message);
      throw new Error('Failed to create consent request');
    }
  }

  // Get consent status
  async getConsentStatus(consentId) {
    try {
      const client = await this.createAuthenticatedClient();
      const response = await client.get(`/consents/${consentId}`);
      
      return {
        consentId: response.data.consentId,
        status: response.data.status,
        lastUpdated: response.data.lastUpdated
      };
    } catch (error) {
      logger.error('Error fetching consent status:', error.response?.data || error.message);
      throw new Error('Failed to fetch consent status');
    }
  }

  // Revoke consent request
  async revokeConsentRequest(consentId) {
    try {
      const client = await this.createAuthenticatedClient();
      await client.delete(`/consents/${consentId}`);
      
      logger.info(`Consent revoked successfully: ${consentId}`);
      return true;
    } catch (error) {
      logger.error('Error revoking consent:', error.response?.data || error.message);
      throw new Error('Failed to revoke consent');
    }
  }

  // Fetch accounts
  async fetchAccounts(fetchData) {
    try {
      const client = await this.createAuthenticatedClient();
      
      const payload = {
        consentId: fetchData.consentId,
        DataRange: {
          from: fetchData.dataRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: fetchData.dataRange?.to || new Date().toISOString()
        },
        format: 'json'
      };

      const response = await client.post('/data/fetch', payload);
      
      logger.info(`Accounts fetched successfully for consent: ${fetchData.consentId}`);
      
      return {
        accounts: response.data.accounts || [],
        totalCount: response.data.accounts?.length || 0
      };
    } catch (error) {
      logger.error('Error fetching accounts:', error.response?.data || error.message);
      throw new Error('Failed to fetch accounts');
    }
  }

  // Fetch transactions
  async fetchTransactions(fetchData) {
    try {
      const client = await this.createAuthenticatedClient();
      
      const payload = {
        consentId: fetchData.consentId,
        accountId: fetchData.accountId,
        DataRange: {
          from: fetchData.dataRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: fetchData.dataRange?.to || new Date().toISOString()
        },
        format: 'json'
      };

      const response = await client.post('/data/fetch', payload);
      
      logger.info(`Transactions fetched successfully for account: ${fetchData.accountId}`);
      
      return {
        transactions: response.data.transactions || [],
        totalCount: response.data.transactions?.length || 0
      };
    } catch (error) {
      logger.error('Error fetching transactions:', error.response?.data || error.message);
      throw new Error('Failed to fetch transactions');
    }
  }

  // Fetch and store accounts for a consent
  async fetchAndStoreAccounts(consentId, userId) {
    try {
      const dataRange = {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      };

      const response = await this.fetchAccounts({ consentId, dataRange });
      
      const storedAccounts = [];
      for (const accountData of response.accounts) {
        const account = await Account.findOneAndUpdate(
          { accountId: accountData.accountId, userId },
          {
            userId,
            consentId,
            accountId: accountData.accountId,
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
        
        storedAccounts.push(account);
      }

      logger.info(`Stored ${storedAccounts.length} accounts for user ${userId}`);
      return storedAccounts;
    } catch (error) {
      logger.error('Error fetching and storing accounts:', error);
      throw error;
    }
  }

  // Fetch and store transactions for an account
  async fetchAndStoreTransactions(consentId, accountId, userId) {
    try {
      const dataRange = {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      };

      const response = await this.fetchTransactions({ consentId, accountId, dataRange });
      
      const storedTransactions = [];
      for (const transactionData of response.transactions) {
        const transaction = await Transaction.findOneAndUpdate(
          { transactionId: transactionData.transactionId, userId },
          {
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
            lastFetched: new Date(),
            lastUpdated: new Date()
          },
          { 
            upsert: true, 
            new: true,
            setDefaultsOnInsert: true
          }
        );
        
        storedTransactions.push(transaction);
      }

      logger.info(`Stored ${storedTransactions.length} transactions for account ${accountId}`);
      return storedTransactions;
    } catch (error) {
      logger.error('Error fetching and storing transactions:', error);
      throw error;
    }
  }

  // Fetch and store all data for a consent
  async fetchAndStoreData(consentId, userId) {
    try {
      // First fetch and store accounts
      const accounts = await this.fetchAndStoreAccounts(consentId, userId);
      
      // Then fetch and store transactions for each account
      const allTransactions = [];
      for (const account of accounts) {
        try {
          const transactions = await this.fetchAndStoreTransactions(consentId, account.accountId, userId);
          allTransactions.push(...transactions);
        } catch (error) {
          logger.error(`Error fetching transactions for account ${account.accountId}:`, error);
        }
      }

      logger.info(`Data fetch completed for consent ${consentId}: ${accounts.length} accounts, ${allTransactions.length} transactions`);
      
      return {
        accounts,
        transactions: allTransactions
      };
    } catch (error) {
      logger.error('Error fetching and storing data:', error);
      throw error;
    }
  }

  // Get available FIPs (Financial Information Providers)
  async getAvailableFIPs() {
    try {
      const client = await this.createAuthenticatedClient();
      const response = await client.get('/fi-types');
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching available FIPs:', error.response?.data || error.message);
      throw new Error('Failed to fetch available FIPs');
    }
  }

  // Validate webhook signature
  validateWebhookSignature(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.SETU_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Error validating webhook signature:', error);
      return false;
    }
  }
}

module.exports = new SetuService(); 