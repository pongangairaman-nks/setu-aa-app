import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '../../config/environment';
import { 
  ConsentRequest, 
  ConsentResponse, 
  FetchDataRequest 
} from '../../types/api';

interface SetuAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class SetuDirectApiClient {
  private client: AxiosInstance;
  private authClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Auth client for getting tokens
    this.authClient = axios.create({
      baseURL: 'https://orgservice-prod.setu.co',
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'client': 'bridge'
      },
    });

    // Main API client for Setu operations
    this.client = axios.create({
      baseURL: ENV.SETU_API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `${ENV.APP_NAME}/${ENV.VERSION}`,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Log requests in development
        if (ENV.IS_DEVELOPMENT && ENV.ENABLE_LOGGING) {
          console.log(`🌐 Setu API Request: ${config.method?.toUpperCase()} ${config.url}`);
          console.log(`📡 Setu Base URL: ${ENV.SETU_API_BASE_URL}`);
        }

        // Get fresh token if needed
        await this.ensureValidToken();

        // Add auth token if available
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
          config.headers['x-product-instance-id'] = ENV.SETU_PRODUCT_ID;
        }

        return config;
      },
      (error) => {
        if (ENV.IS_DEVELOPMENT) {
          console.error('❌ Setu Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (ENV.IS_DEVELOPMENT && ENV.ENABLE_LOGGING) {
          console.log(`✅ Setu API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        // Log errors
        if (ENV.IS_DEVELOPMENT) {
          console.error('❌ Setu API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.error?.message || error.message,
            data: error.response?.data,
          });
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          console.error('🔒 Setu API Unauthorized - token may be expired, refreshing...');
          // Clear token and try to refresh
          this.accessToken = null;
          this.tokenExpiry = 0;
        } else if (error.response?.status === 400) {
          console.error('🔧 Setu API Bad Request - check request payload');
        } else if (error.response?.status === 500) {
          console.error('🔧 Setu API Server Error');
        } else if (error.code === 'ECONNABORTED') {
          console.error('⏰ Setu API Request timeout');
        } else if (error.code === 'NETWORK_ERROR') {
          console.error('🌐 Setu API Network error');
        }

        return Promise.reject(error);
      }
    );
  }

  private async getAccessToken(): Promise<string> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔐 Getting Setu access token...');
      }

      const authPayload = {
        clientID: ENV.SETU_CLIENT_ID,
        grant_type: 'client_credentials',
        secret: ENV.SETU_CLIENT_SECRET || '1qfpRYp0pgQFuRUhrsIOvBj6vku15Yc2' // Default secret from your curl
      };

      const response = await this.authClient.post<SetuAuthResponse>('/v1/users/login', authPayload);
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Setu access token obtained successfully');
      }

      return response.data.access_token;
    } catch (error) {
      console.error('❌ Failed to get Setu access token:', error);
      throw new Error('Authentication failed with Setu API');
    }
  }

  private async ensureValidToken(): Promise<void> {
    const now = Date.now();
    
    // Check if token is expired or will expire soon (within 5 minutes)
    if (!this.accessToken || now >= (this.tokenExpiry - 5 * 60 * 1000)) {
      this.accessToken = await this.getAccessToken();
      // Set expiry to 1 hour from now (or use expires_in from response)
      this.tokenExpiry = now + (60 * 60 * 1000); // 1 hour
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Get current Setu API base URL
  public getBaseUrl(): string {
    return ENV.SETU_API_BASE_URL;
  }

  // Check if using HTTPS
  public isSecure(): boolean {
    return ENV.SETU_API_BASE_URL.startsWith('https://');
  }

  // Get authentication status
  public getAuthStatus(): { hasToken: boolean; tokenExpiry: number } {
    return {
      hasToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry
    };
  }
}

export const setuDirectApiClient = new SetuDirectApiClient();
