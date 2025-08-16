const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');

// Setu API configuration
const SETU_CONFIG = {
  AUTH_URL: 'https://orgservice-prod.setu.co',
  CLIENT_ID: 'b615a43a-e779-4d95-9ddb-768c7666d96b',
  CLIENT_SECRET: 'eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM'
};

// Get Setu access token
async function getSetuAccessToken() {
  try {
    logger.info('Getting Setu access token...');
    
    const authPayload = {
      clientID: SETU_CONFIG.CLIENT_ID,
      grant_type: 'client_credentials',
      secret: SETU_CONFIG.CLIENT_SECRET
    };
    console.log('authPayload',authPayload);

    const response = await axios.post(`${SETU_CONFIG.AUTH_URL}/v1/users/login`, authPayload, {
      headers: {
        'Content-Type': 'application/json',
        'client': 'bridge'
      },
      timeout: 30000
    });
    console.log('response.data',response.data);
    logger.info('Setu access token obtained successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to get Setu access token:', error.response?.data || error.message);
    throw new Error('Authentication failed with Setu API');
  }
}

// Get Setu token endpoint
router.post('/setu-token', async (req, res) => {
  try {
    logger.info('Token request received from frontend');
    
    const tokenResponse = await getSetuAccessToken();
    console.log('tokenResponse',tokenResponse);
    logger.info('Token successfully retrieved and sent to frontend');
    
    // Setu API response only contains access_token and refresh_token
    // We need to calculate expires_in from the JWT token
    const token = tokenResponse.access_token;
    let expiresIn = 3600; // Default 1 hour
    let tokenType = 'Bearer'; // Default token type
    
    // Try to decode JWT to get expiry time
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        const now = Math.floor(Date.now() / 1000);
        expiresIn = payload.exp - now;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT payload:', payload);
          console.log('Token expires at:', new Date(payload.exp * 1000).toISOString());
          console.log('Current time:', new Date().toISOString());
          console.log('Expires in seconds:', expiresIn);
        }
      }
    } catch (jwtError) {
      logger.warn('Could not decode JWT token for expiry calculation:', jwtError.message);
    }
    
    res.json({
      success: true,
      data: {
        access_token: token,
        token_type: tokenType,
        expires_in: expiresIn,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.log('error',error);
    logger.error('Error getting Setu token:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'TOKEN_FETCH_FAILED',
        message: error.message
      }
    });
  }
});

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
