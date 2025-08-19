const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');
const setuTokenManager = require('../services/setuTokenManager');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/authMiddleware');

// Setu API configuration
const SETU_CONFIG = {
  API_URL: process.env.SETU_BASE_URL || 'https://fiu-sandbox.setu.co',
  PRODUCT_ID: process.env.SETU_PRODUCT_ID || 'e02807a8-2588-4306-83d2-5eb1e615abda'
};





// Make authenticated request to Setu API
async function makeSetuRequest(method, endpoint, data = null) {
  try {
    // Get valid Setu token (automatically fetches new one if needed)
    const accessToken = await setuTokenManager.getValidToken();
    logger.info('Using valid Setu token for API request');

    const config = {
      method,
      url: `${SETU_CONFIG.API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
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
    
    // If token error, clear token and retry once
    if (error.response?.status === 401) {
      logger.info('Token may be invalid, clearing and retrying...');
      setuTokenManager.clearToken();
      
      try {
        const newToken = await setuTokenManager.getValidToken();
        const retryConfig = {
          method,
          url: `${SETU_CONFIG.API_URL}${endpoint}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            'x-product-instance-id': SETU_CONFIG.PRODUCT_ID
          },
          timeout: 30000
        };

        if (data) {
          retryConfig.data = data;
        }

        const retryResponse = await axios(retryConfig);
        logger.info('Retry successful with new token');
        return retryResponse.data;
      } catch (retryError) {
        logger.error('Retry failed:', retryError.message);
        throw retryError;
      }
    }
    
    throw error;
  }
}

// Consent routes
router.post('/consents', authenticateToken, async (req, res) => {
  try {
    logger.info('Creating Setu consent request:', req.body);
    const result = await makeSetuRequest('POST', '/v2/consents', req.body);
    
    // Update user's consent details if consent was created successfully
    if (result && result.id) {
      try {
        // Get user ID from authenticated request
        const userId = req.user?.id;
        
        if (userId) {
          // Update user's consent details
          const user = await User.findByIdAndUpdate(
            userId,
            {
              'consentDetails.consentId': result.id,
              'consentDetails.consentStatus': 'PENDING',
              'consentDetails.consentCreatedAt': new Date(),
              'consentDetails.consentUpdatedAt': new Date(),
              'consentDetails.consentExpiresAt': new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
            },
            { new: true }
          );

          if (user) {
            logger.info(`User consent details updated: ${user.email} -> ${result.id}`);
          } else {
            logger.warn(`No user found with ID: ${userId}`);
          }
        } else {
          logger.warn('No user ID found in request, skipping consent details update');
        }
      } catch (updateError) {
        logger.error('Error updating user consent details:', updateError);
        // Don't fail the request if consent details update fails
      }
    }
    
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
    const { expanded } = req.query;
    logger.info('Getting Setu consent:', consentId, 'expanded:', expanded);
    
    // Build the URL with query parameters
    let url = `/v2/consents/${consentId}`;
    if (expanded) {
      url += `?expanded=${expanded}`;
    }
    
    const result = await makeSetuRequest('GET', url);
    res.json(result);
  } catch (error) {
    logger.error('Error getting consent:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to get consent' }
    });
  }
});

// Get consent details with expanded information
router.get('/consents/:consentId/details', async (req, res) => {
  try {
    const { consentId } = req.params;
    logger.info('Getting Setu consent details with expanded info:', consentId);
    
    // Always get expanded details for consent details endpoint
    const result = await makeSetuRequest('GET', `/v2/consents/${consentId}?expanded=true`);
    res.json(result);
  } catch (error) {
    logger.error('Error getting consent details:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to get consent details' }
    });
  }
});

// Data Session Management
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { consentId, dataRange, format = 'json' } = req.body;
    logger.info('Creating data session with consent ID:', consentId);
    
    // Validate required fields
    if (!consentId) {
      return res.status(400).json({
        error: { message: 'consentId is required in request body' }
      });
    }
    
    if (!dataRange || !dataRange.from || !dataRange.to) {
      return res.status(400).json({
        error: { message: 'dataRange with from and to dates is required' }
      });
    }
    
    const requestBody = {
      consentId,
      dataRange,
      format
    };
    
    logger.info('Sending request to Setu API:', requestBody);
    const result = await makeSetuRequest('POST', '/v2/sessions', requestBody);
    logger.info('Data session created successfully:', result);
    
    res.json(result);
  } catch (error) {
    logger.error('Error creating data session:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to create data session' }
    });
  }
});

router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    logger.info('Getting data session:', sessionId);
    
    const result = await makeSetuRequest('GET', `/v2/sessions/${sessionId}`);
    res.json(result);
  } catch (error) {
    logger.error('Error getting data session:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to get data session' }
    });
  }
});

router.get('/sessions/:sessionId/data', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    logger.info('Fetching FI data for session:', sessionId);
    
    const result = await makeSetuRequest('GET', `/v2/sessions/${sessionId}/data`);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching FI data:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to fetch FI data' }
    });
  }
});

router.post('/consents/:consentId/revoke', async (req, res) => {
  try {
    const { consentId } = req.params;
    logger.info('Revoking Setu consent:', consentId);
    
    // Call Setu API to revoke consent
    const result = await makeSetuRequest('POST', `/v2/consents/${consentId}/revoke`);
    
    // If revocation is successful, update user's consent status in database
    if (result && result.status === 'REVOKED') {
      try {
        const user = await User.findOneAndUpdate(
          { 'consentDetails.consentId': consentId },
          {
            'consentDetails.consentStatus': 'REVOKED',
            'consentDetails.consentUpdatedAt': new Date()
          },
          { new: true }
        );

        if (user) {
          logger.info(`User consent status updated to REVOKED: ${user.email}`);
        } else {
          logger.warn(`No user found with consent ID: ${consentId}`);
        }
      } catch (updateError) {
        logger.error('Error updating user consent status:', updateError);
      }
    }
    
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
    const result = await makeSetuRequest('GET', `/v2/consents/${consentId}/fetch/status`);
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
    const result = await makeSetuRequest('GET', `/v2/consents/${consentId}/data-sessions`);
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
