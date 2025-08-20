import { secureStorage } from '../storage/secureStorage';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { tokenService } from './tokenService';

const USER_DATA_KEY = 'user_data';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  consentDetails?: {
    consentId: string | null;
    consentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | null;
    consentCreatedAt: string | null;
    consentUpdatedAt: string | null;
    consentExpiresAt: string | null;
  };
  profile?: any;
  accounts?: any[];
  transactions?: any[];
}

class AuthService {
  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      await this.storeTokens(response.access_token, response.refresh_token);
      await this.storeUserData(response.user);
      
      this.currentUser = response.user;
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      await this.clearTokens();
      await this.clearUserData();
      this.currentUser = null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await tokenService.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await apiClient.post<{ access_token: string }>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refresh_token: refreshToken }
      );

      await tokenService.storeAuthToken(response.access_token);
      return response.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return null;
    }
  }

  async getAuthToken(): Promise<string | null> {
    return tokenService.getAuthToken();
  }

  async getRefreshToken(): Promise<string | null> {
    return tokenService.getRefreshToken();
  }

  async getUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const userData = await secureStorage.getItemAsync(USER_DATA_KEY);
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await tokenService.storeAuthToken(accessToken);
      await tokenService.storeRefreshToken(refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  private async storeUserData(user: User): Promise<void> {
    try {
      await secureStorage.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  private async clearTokens(): Promise<void> {
    await tokenService.clearTokens();
  }

  private async clearUserData(): Promise<void> {
    try {
      await secureStorage.deleteItemAsync(USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

export const authService = new AuthService();

// Export individual functions for convenience
export const login = (credentials: LoginCredentials) => authService.login(credentials);
export const logout = () => authService.logout();
export const getAuthToken = () => authService.getAuthToken();
export const getUser = () => authService.getUser();
export const isAuthenticated = () => authService.isAuthenticated(); 