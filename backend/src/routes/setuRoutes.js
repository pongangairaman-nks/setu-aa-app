const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');

// Setu API configuration
const SETU_CONFIG = {
  AUTH_URL: 'https://orgservice-prod.setu.co',
  API_URL: 'https://fiu.setu.co',
  CLIENT_ID: 'b615a43a-e779-4d95-9ddb-768c7666d96b',
  CLIENT_SECRET: 'eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM',
  PRODUCT_ID: 'e02807a8-2588-4306-83d2-5eb1e615abda'
};

let accessToken = null;
let tokenExpiry = 0;

// Get Setu access token
async function getSetuAccessToken() {
  try {
    const now = Date.now();
    
    // Check if token is expired or will expire soon (within 5 minutes)
    if (!accessToken || now >= (tokenExpiry - 5 * 60 * 1000)) {
      logger.info('Getting new Setu access token...');
      
      const authPayload = {
        clientID: SETU_CONFIG.CLIENT_ID,
        grant_type: 'client_credentials',
        secret: SETU_CONFIG.CLIENT_SECRET
      };

      const response = await axios.post(`${SETU_CONFIG.AUTH_URL}/v1/users/login`, authPayload, {
        headers: {
          'Content-Type': 'application/json',
          'client': 'bridge'
        },
        timeout: 30000
      });

      accessToken = response.data.access_token;
      // Set expiry to 1 hour from now
      tokenExpiry = now + (60 * 60 * 1000);
      
      logger.info('Setu access token obtained successfully');
    }
    
    return accessToken;
  } catch (error) {
    logger.error('Failed to get Setu access token:', error.message);
    throw new Error('Authentication failed with Setu API');
  }
}

// Make authenticated request to Setu API
async function makeSetuRequest(method, endpoint, data = null) {
  try {
    const token = await getSetuAccessToken();
    
    const config = {
      method,
      url: `${SETU_CONFIG.API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-product-instance-id': SETU_CONFIG.PRODUCT_ID
      },
      timeout: 30000
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    logger.error(`Setu API request failed (${method} ${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
}

// Consent routes
router.post('/consents', async (req, res) => {
  try {
    logger.info('Creating Setu consent request:', req.body);
    const result = await makeSetuRequest('POST', '/consents', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error creating consent:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to create consent' }
    });
  }
});

router.get('/consents/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    logger.info('Getting Setu consent:', consentId);
    const result = await makeSetuRequest('GET', `/consents/${consentId}`);
    res.json(result);
  } catch (error) {
    logger.error('Error getting consent:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to get consent' }
    });
  }
});

router.post('/consents/:consentId/revoke', async (req, res) => {
  try {
    const { consentId } = req.params;
    logger.info('Revoking Setu consent:', consentId);
    const result = await makeSetuRequest('POST', `/consents/${consentId}/revoke`);
    res.json(result);
  } catch (error) {
    logger.error('Error revoking consent:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to revoke consent' }
    });
  }
});

router.get('/consents/:consentId/fetch/status', async (req, res) => {
  try {
    const { consentId } = req.params;
    logger.info('Getting Setu consent fetch status:', consentId);
    const result = await makeSetuRequest('GET', `/consents/${consentId}/fetch/status`);
    res.json(result);
  } catch (error) {
    logger.error('Error getting consent fetch status:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to get consent fetch status' }
    });
  }
});

router.get('/consents/:consentId/data-sessions', async (req, res) => {
  try {
    const { consentId } = req.params;
    logger.info('Getting Setu consent data sessions:', consentId);
    const result = await makeSetuRequest('GET', `/consents/${consentId}/data-sessions`);
    res.json(result);
  } catch (error) {
    logger.error('Error getting consent data sessions:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to get consent data sessions' }
    });
  }
});

// Multi consent routes
router.post('/consents/collection', async (req, res) => {
  try {
    logger.info('Creating Setu multi consent:', req.body);
    const result = await makeSetuRequest('POST', '/consents/collection', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error creating multi consent:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to create multi consent' }
    });
  }
});

// Data routes
router.post('/data/fetch', async (req, res) => {
  try {
    logger.info('Fetching Setu data:', req.body);
    const result = await makeSetuRequest('POST', '/data/fetch', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching data:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to fetch data' }
    });
  }
});

router.get('/data/sessions', async (req, res) => {
  try {
    logger.info('Getting Setu data sessions');
    const result = await makeSetuRequest('GET', '/data/sessions');
    res.json(result);
  } catch (error) {
    logger.error('Error getting data sessions:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to get data sessions' }
    });
  }
});

// FIP routes
router.get('/fips', async (req, res) => {
  try {
    logger.info('Getting Setu FIPs');
    const result = await makeSetuRequest('GET', '/fips');
    res.json(result);
  } catch (error) {
    logger.error('Error getting FIPs:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to get FIPs' }
    });
  }
});

// Health check for Setu API
router.get('/health', async (req, res) => {
  try {
    logger.info('Checking Setu API health');
    const result = await makeSetuRequest('GET', '/fips');
    res.json({
      status: 'healthy',
      setuApi: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Setu API health check failed:', error.message);
    res.status(500).json({
      status: 'unhealthy',
      setuApi: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
