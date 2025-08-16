import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken } from '../auth/authService';
import { ENV } from '../../config/environment';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `${ENV.APP_NAME}/${ENV.VERSION}`,
      },
      // HTTPS configuration for production
      ...(ENV.IS_PRODUCTION && {
        httpsAgent: {
          rejectUnauthorized: true, // Ensure SSL certificate validation
        },
      }),
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Log requests in development
        if (ENV.IS_DEVELOPMENT && ENV.ENABLE_LOGGING) {
          console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        // Add auth token if available
        try {
          const token = await getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          // Token not available, continue without auth
          if (ENV.IS_DEVELOPMENT) {
            console.warn('No auth token available');
          }
        }

        return config;
      },
      (error) => {
        if (ENV.IS_DEVELOPMENT) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (ENV.IS_DEVELOPMENT && ENV.ENABLE_LOGGING) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        // Log errors
        if (ENV.IS_DEVELOPMENT) {
          console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.error?.message || error.message,
          });
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.error('🔒 Unauthorized access - token may be expired');
          // You can trigger re-authentication here
        } else if (error.response?.status === 500) {
          console.error('🔧 Server error - please try again later');
        } else if (error.code === 'ECONNABORTED') {
          console.error('⏰ Request timeout - please check your connection');
        } else if (error.code === 'NETWORK_ERROR') {
          console.error('🌐 Network error - please check your internet connection');
        } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
          console.error('🔒 SSL Certificate error - please contact support');
        } else if (error.code === 'ENOTFOUND') {
          console.error('🌐 Domain not found - please check your internet connection');
        }

        return Promise.reject(error);
      }
    );
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

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get current API base URL
  public getBaseUrl(): string {
    return ENV.API_BASE_URL;
  }

  // Check if using HTTPS
  public isSecure(): boolean {
    return ENV.API_BASE_URL.startsWith('https://');
  }
}

export const apiClient = new ApiClient(); 