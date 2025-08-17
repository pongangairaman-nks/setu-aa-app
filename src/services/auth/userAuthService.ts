import { apiClient } from '../api/apiClient';
import { secureStorage } from '../storage/secureStorage';
import { ENV } from '../../config/environment';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

const USER_TOKEN_KEY = 'user_auth_token';
const USER_DATA_KEY = 'user_data';

class UserAuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<User> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('👤 Registering new user:', request.email);
      }

      const response = await apiClient.post<User>('/auth/register', request);
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ User registered successfully');
      }

      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔐 Logging in user:', request.email);
      }

      const response = await apiClient.post<LoginResponse>('/auth/login', request);
      
      // Store token and user data
      await this.storeAuthData(response.token, response.user);
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ User logged in successfully');
      }

      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('❌ Logout API call failed:', error);
    } finally {
      // Clear local data regardless of API call success
      await this.clearAuthData();
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ User logged out successfully');
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;

      // Verify token with backend
      const response = await apiClient.get<User>('/auth/me');
      this.currentUser = response;
      return true;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      await this.clearAuthData();
      return false;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;

    try {
      const response = await apiClient.get<User>('/auth/me');
      this.currentUser = response;
      return response;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get auth token for API calls
   */
  async getAuthToken(): Promise<string | null> {
    if (this.authToken) return this.authToken;

    const token = await this.getStoredToken();
    if (token) {
      this.authToken = token;
      return token;
    }

    return null;
  }

  /**
   * Store authentication data
   */
  private async storeAuthData(token: string, user: User): Promise<void> {
    try {
      await secureStorage.setItemAsync(USER_TOKEN_KEY, token);
      await secureStorage.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
      
      this.authToken = token;
      this.currentUser = user;
    } catch (error) {
      console.error('❌ Failed to store auth data:', error);
      throw error;
    }
  }

  /**
   * Get stored token
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      return await secureStorage.getItemAsync(USER_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Failed to get stored token:', error);
      return null;
    }
  }

  /**
   * Clear authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      await secureStorage.deleteItemAsync(USER_TOKEN_KEY);
      await secureStorage.deleteItemAsync(USER_DATA_KEY);
      
      this.authToken = null;
      this.currentUser = null;
    } catch (error) {
      console.error('❌ Failed to clear auth data:', error);
    }
  }
}

export const userAuthService = new UserAuthService();
