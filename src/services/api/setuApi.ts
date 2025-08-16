import { apiClient } from './apiClient';
import { API_ENDPOINTS, buildUrl } from './endpoints';
import { 
  ConsentRequest, 
  ConsentResponse, 
  AccountResponse, 
  TransactionResponse,
  FetchDataRequest 
} from '../../types/api';
import { ENV } from '../../config/environment';

export class SetuApi {
  // Consent Management
  async createConsentRequest(request: ConsentRequest): Promise<ConsentResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔐 Creating consent request:', request);
      }
      return await apiClient.post<ConsentResponse>(API_ENDPOINTS.CONSENT.CREATE, request);
    } catch (error) {
      console.error('❌ Failed to create consent request:', error);
      throw error;
    }
  }

  async getConsentRequest(consentId: string): Promise<ConsentResponse> {
    try {
      const url = buildUrl(API_ENDPOINTS.CONSENT.GET, { consentId });
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔍 Fetching consent request:', consentId);
      }
      return await apiClient.get<ConsentResponse>(url);
    } catch (error) {
      console.error('❌ Failed to get consent request:', error);
      throw error;
    }
  }

  async updateConsentRequest(consentId: string, request: Partial<ConsentRequest>): Promise<ConsentResponse> {
    try {
      const url = buildUrl(API_ENDPOINTS.CONSENT.UPDATE, { consentId });
      if (ENV.IS_DEVELOPMENT) {
        console.log('✏️ Updating consent request:', consentId, request);
      }
      return await apiClient.put<ConsentResponse>(url, request);
    } catch (error) {
      console.error('❌ Failed to update consent request:', error);
      throw error;
    }
  }

  async revokeConsentRequest(consentId: string): Promise<void> {
    try {
      const url = buildUrl(API_ENDPOINTS.CONSENT.REVOKE, { consentId });
      if (ENV.IS_DEVELOPMENT) {
        console.log('🚫 Revoking consent request:', consentId);
      }
      return await apiClient.post<void>(url);
    } catch (error) {
      console.error('❌ Failed to revoke consent request:', error);
      throw error;
    }
  }

  async getConsentStatus(consentId: string): Promise<{ status: string }> {
    try {
      const url = buildUrl(API_ENDPOINTS.CONSENT.STATUS, { consentId });
      if (ENV.IS_DEVELOPMENT) {
        console.log('📊 Getting consent status:', consentId);
      }
      return await apiClient.get<{ status: string }>(url);
    } catch (error) {
      console.error('❌ Failed to get consent status:', error);
      throw error;
    }
  }

  // Data Fetching
  async fetchAccounts(request: FetchDataRequest): Promise<AccountResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🏦 Fetching accounts:', request);
      }
      return await apiClient.post<AccountResponse>(API_ENDPOINTS.ACCOUNTS.FETCH, request);
    } catch (error) {
      console.error('❌ Failed to fetch accounts:', error);
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<AccountResponse> {
    try {
      const url = buildUrl(API_ENDPOINTS.ACCOUNTS.GET, { accountId });
      if (ENV.IS_DEVELOPMENT) {
        console.log('🏦 Getting account details:', accountId);
      }
      return await apiClient.get<AccountResponse>(url);
    } catch (error) {
      console.error('❌ Failed to get account:', error);
      throw error;
    }
  }

  async fetchTransactions(request: FetchDataRequest): Promise<TransactionResponse> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('💳 Fetching transactions:', request);
      }
      return await apiClient.post<TransactionResponse>(API_ENDPOINTS.TRANSACTIONS.FETCH, request);
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<TransactionResponse> {
    try {
      const url = buildUrl(API_ENDPOINTS.TRANSACTIONS.GET, { transactionId });
      if (ENV.IS_DEVELOPMENT) {
        console.log('💳 Getting transaction details:', transactionId);
      }
      return await apiClient.get<TransactionResponse>(url);
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

  async getFIPs(): Promise<{ fips: Array<{ id: string; name: string }> }> {
    try {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🏛️ Fetching FIPs...');
      }
      return await apiClient.get<{ fips: Array<{ id: string; name: string }> }>('/fips');
    } catch (error) {
      console.error('❌ Failed to fetch FIPs:', error);
      throw error;
    }
  }

  // Get API configuration info
  getApiInfo() {
    return {
      baseUrl: apiClient.getBaseUrl(),
      isSecure: apiClient.isSecure(),
      environment: ENV.NODE_ENV,
      timeout: ENV.API_TIMEOUT,
    };
  }
}

export const setuApi = new SetuApi(); 