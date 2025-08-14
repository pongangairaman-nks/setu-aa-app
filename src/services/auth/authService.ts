import { secureStorage } from '../storage/secureStorage';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
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
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await apiClient.post<{ access_token: string }>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refresh_token: refreshToken }
      );

      await this.storeAuthToken(response.access_token);
      return response.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return null;
    }
  }

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
      await secureStorage.setItemAsync(AUTH_TOKEN_KEY, accessToken);
      await secureStorage.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  private async storeAuthToken(token: string): Promise<void> {
    try {
      await secureStorage.setItemAsync(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
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
    try {
      await secureStorage.deleteItemAsync(AUTH_TOKEN_KEY);
      await secureStorage.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
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