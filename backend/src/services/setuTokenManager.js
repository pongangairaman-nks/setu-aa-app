const axios = require('axios');
const logger = require('../utils/logger');

// Setu API configuration
const SETU_CONFIG = {
  AUTH_URL: 'https://orgservice-sandbox.setu.co',
  CLIENT_ID: process.env.SETU_CLIENT_ID || 'b615a43a-e779-4d95-9ddb-768c7666d96b',
  CLIENT_SECRET: process.env.SETU_CLIENT_SECRET || 'eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM'
};

class SetuTokenManager {
  constructor() {
    this.currentToken = null;
    this.tokenExpiry = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Get a valid Setu token (fetch new one if needed)
   */
  async getValidToken() {
    try {
      // Check if we have a valid token
      if (this.isTokenValid()) {
        logger.info('Using existing valid Setu token');
        return this.currentToken;
      }

      // If already refreshing, wait for that promise
      if (this.isRefreshing && this.refreshPromise) {
        logger.info('Token refresh already in progress, waiting...');
        return await this.refreshPromise;
      }

      // Fetch new token
      logger.info('Fetching new Setu token...');
      return await this.fetchNewToken();
    } catch (error) {
      logger.error('Failed to get valid Setu token:', error);
      throw error;
    }
  }

  /**
   * Check if current token is valid
   */
  isTokenValid() {
    if (!this.currentToken || !this.tokenExpiry) {
      return false;
    }

    // Check if token expires in the next 5 minutes
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    const isValid = Date.now() < (this.tokenExpiry - bufferTime);
    
    if (!isValid) {
      logger.info('Setu token expired or will expire soon');
    }
    
    return isValid;
  }

  /**
   * Fetch new token from Setu
   */
  async fetchNewToken() {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._fetchToken();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Internal method to fetch token
   */
  async _fetchToken() {
    try {
      logger.info('Making request to Setu auth service...');
      
      const response = await axios.post(`${SETU_CONFIG.AUTH_URL}/v1/users/login`, {
        clientID: SETU_CONFIG.CLIENT_ID,
        grant_type: 'client_credentials',
        secret: SETU_CONFIG.CLIENT_SECRET
      }, {
        headers: {
          'Content-Type': 'application/json',
          'client': 'bridge'
        },
        timeout: 10000
      });

      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from Setu auth service');
      }

      const tokenData = response.data;
      
      // Calculate expiry time (default to 30 minutes if not provided)
      const expiresIn = tokenData.expires_in || 1800; // 30 minutes
      this.tokenExpiry = Date.now() + (expiresIn * 1000);
      this.currentToken = tokenData.access_token;

      logger.info(`Setu token fetched successfully, expires in ${expiresIn} seconds`);
      
      return this.currentToken;
    } catch (error) {
      logger.error('Failed to fetch Setu token:', error.message);
      if (error.response) {
        logger.error('Setu auth response:', error.response.data);
      }
      throw new Error(`Failed to fetch Setu token: ${error.message}`);
    }
  }

  /**
   * Clear current token (force refresh on next request)
   */
  clearToken() {
    this.currentToken = null;
    this.tokenExpiry = null;
    logger.info('Setu token cleared');
  }

  /**
   * Get token info for debugging
   */
  getTokenInfo() {
    return {
      hasToken: !!this.currentToken,
      isValid: this.isTokenValid(),
      expiresAt: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      timeUntilExpiry: this.tokenExpiry ? this.tokenExpiry - Date.now() : null,
      isRefreshing: this.isRefreshing
    };
  }
}

// Export singleton instance
const setuTokenManager = new SetuTokenManager();
module.exports = setuTokenManager;
