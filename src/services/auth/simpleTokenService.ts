import { apiClient } from '../api/apiClient';
import { secureStorage } from '../storage/secureStorage';
import { ENV } from '../../config/environment';

interface SetuTokenResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    timestamp: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface SetuToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  timestamp: string;
  expires_at: number; // Calculated expiry timestamp
}

const TOKEN_STORAGE_KEY = 'setu_access_token';

class SimpleTokenService {
  private currentToken: SetuToken | null = null;

  /**
   * Fetch a new token from the backend
   */
  async fetchToken(): Promise<SetuToken> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔐 Fetching Setu token from backend...');
      }

      const response = await apiClient.post<SetuTokenResponse>('/setu-auth/setu-token');
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch token');
      }

      const token: SetuToken = {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        timestamp: response.data.timestamp,
        expires_at: Date.now() + (response.data.expires_in * 1000) - (5 * 60 * 1000) // 5 minutes buffer
      };

      // Store token securely
      await this.storeToken(token);
      this.currentToken = token;

      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Setu token fetched and stored successfully');
        console.log(`Token expires at: ${new Date(token.expires_at).toISOString()}`);
      }

      return token;
    } catch (error) {
      console.error('❌ Failed to fetch Setu token:', error);
      throw error;
    }
  }

  /**
   * Get current valid token (fetch new one if expired)
   */
  async getValidToken(): Promise<string> {
    try {
      // Check if we have a valid token in memory
      if (this.currentToken && Date.now() < this.currentToken.expires_at) {
        return this.currentToken.access_token;
      }

      // Try to get stored token
      const storedToken = await this.getStoredToken();
      if (storedToken && Date.now() < storedToken.expires_at) {
        this.currentToken = storedToken;
        return storedToken.access_token;
      }

      // Fetch new token
      const newToken = await this.fetchToken();
      return newToken.access_token;
    } catch (error) {
      console.error('❌ Failed to get valid token:', error);
      throw error;
    }
  }

  /**
   * Store token securely
   */
  private async storeToken(token: SetuToken): Promise<void> {
    try {
      await secureStorage.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(token));
    } catch (error) {
      console.error('❌ Failed to store token:', error);
      throw error;
    }
  }

  /**
   * Get stored token
   */
  private async getStoredToken(): Promise<SetuToken | null> {
    try {
      const tokenData = await secureStorage.getItemAsync(TOKEN_STORAGE_KEY);
      if (!tokenData) return null;
      
      return JSON.parse(tokenData) as SetuToken;
    } catch (error) {
      console.error('❌ Failed to get stored token:', error);
      return null;
    }
  }

  /**
   * Clear stored token
   */
  async clearToken(): Promise<void> {
    try {
      await secureStorage.deleteItemAsync(TOKEN_STORAGE_KEY);
      this.currentToken = null;
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('🗑️ Setu token cleared');
      }
    } catch (error) {
      console.error('❌ Failed to clear token:', error);
    }
  }

  /**
   * Check if token is valid
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      return token ? Date.now() < token.expires_at : false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get token info for debugging
   */
  async getTokenInfo(): Promise<{
    hasToken: boolean;
    isValid: boolean;
    expiresAt?: string;
    timeUntilExpiry?: number;
  }> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        return { hasToken: false, isValid: false };
      }

      const isValid = Date.now() < token.expires_at;
      const timeUntilExpiry = token.expires_at - Date.now();

      return {
        hasToken: true,
        isValid,
        expiresAt: new Date(token.expires_at).toISOString(),
        timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0
      };
    } catch (error) {
      return { hasToken: false, isValid: false };
    }
  }
}

export const simpleTokenService = new SimpleTokenService();
