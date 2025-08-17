import { apiClient } from './apiClient';
import { setuDirectApiClient } from './setuDirectApi';
import { simpleTokenService } from '../auth/simpleTokenService';
import { API_ENDPOINTS, buildUrl } from './endpoints';
import { 
  ConsentRequest, 
  ConsentResponse, 
  AccountResponse, 
  TransactionResponse, 
  FetchDataRequest,
  SandboxConsentRequest
} from '../../types/api';
import { ENV } from '../../config/environment';

export class SetuApi {
  // Consent Management - Route through backend (backend handles Setu token automatically)
  async createConsentRequest(request: ConsentRequest | SandboxConsentRequest): Promise<ConsentResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔐 Creating consent request via backend:', request);
      }
      
      // Route through backend - backend will automatically handle Setu token
      const response = await apiClient.post<ConsentResponse>('/setu/consents', request);
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Backend consent creation response:', response);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Failed to create consent request:', error);
      throw error;
    }
  }

  async getConsentRequest(consentId: string): Promise<ConsentResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔍 Fetching consent request via backend:', consentId);
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.get<ConsentResponse>(`/setu/consents/${consentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to get consent request:', error);
      throw error;
    }
  }

  async revokeConsentRequest(consentId: string): Promise<{ status: string; traceId: string }> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🚫 Revoking consent request via backend:', consentId);
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.post<{ status: string; traceId: string }>(`/setu/consents/${consentId}/revoke`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to revoke consent request:', error);
      throw error;
    }
  }

  async getConsentStatus(consentId: string): Promise<ConsentResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('📊 Getting consent status via backend:', consentId);
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.get<ConsentResponse>(`/setu/consents/${consentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to get consent status:', error);
      throw error;
    }
  }

  async getConsentFetchStatus(consentId: string): Promise<any> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('📊 Getting consent fetch status via backend:', consentId);
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.get<any>(`/setu/consents/${consentId}/fetch/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to get consent fetch status:', error);
      throw error;
    }
  }

  async getConsentDataSessions(consentId: string): Promise<any> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('📊 Getting consent data sessions via backend:', consentId);
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.get<any>(`/setu/consents/${consentId}/data-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to get consent data sessions:', error);
      throw error;
    }
  }

  // Multi Consent Management
  async createMultiConsent(optionalConsents: string[], mandatoryConsents: string[]): Promise<any> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔐 Creating multi consent via backend:', { optionalConsents, mandatoryConsents });
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.post<any>('/setu/consents/collection', {
        optionalConsents,
        mandatoryConsents
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to create multi consent:', error);
      throw error;
    }
  }

  // Data Fetching - Route through backend
  async fetchData(request: FetchDataRequest): Promise<any> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('📊 Fetching data via backend:', request);
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.post<any>('/setu/data/fetch', request, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      throw error;
    }
  }

  async getDataSessions(): Promise<any> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('📊 Getting data sessions via backend');
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.get<any>('/setu/data/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to get data sessions:', error);
      throw error;
    }
  }

  // FIP Management - Route through backend
  async getFIPs(): Promise<{ fips: Array<{ id: string; name: string }> }> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🏛️ Fetching FIPs via backend...');
      }
      
      // Get valid token first
      const token = await simpleTokenService.getValidToken();
      
      return await apiClient.get<{ fips: Array<{ id: string; name: string }> }>('/setu/fips', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to fetch FIPs:', error);
      throw error;
    }
  }

  // Token management methods
  async fetchToken(): Promise<any> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔐 Fetching new Setu token...');
      }
      
      const token = await simpleTokenService.fetchToken();
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Token fetched successfully');
      }
      
      return token;
    } catch (error) {
      console.error('❌ Failed to fetch token:', error);
      throw error;
    }
  }

  async getTokenInfo(): Promise<any> {
    try {
      return await simpleTokenService.getTokenInfo();
    } catch (error) {
      console.error('❌ Failed to get token info:', error);
      throw error;
    }
  }

  async clearToken(): Promise<void> {
    try {
      await simpleTokenService.clearToken();
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('🗑️ Token cleared successfully');
      }
    } catch (error) {
      console.error('❌ Failed to clear token:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility (using your backend)
  async fetchAccounts(request: FetchDataRequest): Promise<AccountResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🏦 Fetching accounts via backend:', request);
      }
      return await apiClient.post<AccountResponse>('/accounts/fetch', request);
    } catch (error) {
      console.error('❌ Failed to fetch accounts:', error);
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<AccountResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🏦 Getting account details via backend:', accountId);
      }
      return await apiClient.get<AccountResponse>(`/accounts/${accountId}`);
    } catch (error) {
      console.error('❌ Failed to get account:', error);
      throw error;
    }
  }

  async fetchTransactions(request: FetchDataRequest): Promise<TransactionResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('💳 Fetching transactions via backend:', request);
      }
      return await apiClient.post<TransactionResponse>('/transactions/fetch', request);
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<TransactionResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('💳 Getting transaction details via backend:', transactionId);
      }
      return await apiClient.get<TransactionResponse>(`/transactions/${transactionId}`);
    } catch (error) {
      console.error('❌ Failed to get transaction:', error);
      throw error;
    }
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string }> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🏥 Performing health check...');
      }
      const result = await apiClient.get<{ status: string }>('/health');
      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Health check successful:', result);
      }
      return result;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }

  // Get API configuration info
  getApiInfo() {
    return {
      backendUrl: apiClient.getBaseUrl(),
      setuUrl: setuDirectApiClient.getBaseUrl(),
      isSecure: apiClient.isSecure(),
      environment: ENV.NODE_ENV,
      timeout: ENV.API_TIMEOUT,
      clientId: ENV.SETU_CLIENT_ID,
      productId: ENV.SETU_PRODUCT_ID,
    };
  }
}

export const setuApi = new SetuApi(); 