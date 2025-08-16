import { secureStorage } from '../storage/secureStorage';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export class TokenService {
  async getAuthToken(): Promise<string | null> {
    try {
      const token = await secureStorage.getItemAsync(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await secureStorage.getItemAsync(REFRESH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async storeAuthToken(token: string): Promise<void> {
    try {
      await secureStorage.setItemAsync(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw error;
    }
  }

  async storeRefreshToken(token: string): Promise<void> {
    try {
      await secureStorage.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw error;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await secureStorage.deleteItemAsync(AUTH_TOKEN_KEY);
      await secureStorage.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }
}

export const tokenService = new TokenService();
