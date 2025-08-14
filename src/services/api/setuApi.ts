import { apiClient } from './apiClient';
import { API_ENDPOINTS, buildUrl } from './endpoints';
import { 
  ConsentRequest, 
  ConsentResponse, 
  AccountResponse, 
  TransactionResponse,
  FetchDataRequest 
} from '../../types/api';

export class SetuApi {
  // Consent Management
  async createConsentRequest(request: ConsentRequest): Promise<ConsentResponse> {
    return apiClient.post<ConsentResponse>(API_ENDPOINTS.CONSENT.CREATE, request);
  }

  async getConsentRequest(consentId: string): Promise<ConsentResponse> {
    const url = buildUrl(API_ENDPOINTS.CONSENT.GET, { consentId });
    return apiClient.get<ConsentResponse>(url);
  }

  async updateConsentRequest(consentId: string, request: Partial<ConsentRequest>): Promise<ConsentResponse> {
    const url = buildUrl(API_ENDPOINTS.CONSENT.UPDATE, { consentId });
    return apiClient.put<ConsentResponse>(url, request);
  }

  async revokeConsentRequest(consentId: string): Promise<void> {
    const url = buildUrl(API_ENDPOINTS.CONSENT.REVOKE, { consentId });
    return apiClient.post<void>(url);
  }

  async getConsentStatus(consentId: string): Promise<{ status: string }> {
    const url = buildUrl(API_ENDPOINTS.CONSENT.STATUS, { consentId });
    return apiClient.get<{ status: string }>(url);
  }

  // Data Fetching
  async fetchAccounts(request: FetchDataRequest): Promise<AccountResponse> {
    return apiClient.post<AccountResponse>(API_ENDPOINTS.ACCOUNTS.FETCH, request);
  }

  async getAccount(accountId: string): Promise<AccountResponse> {
    const url = buildUrl(API_ENDPOINTS.ACCOUNTS.GET, { accountId });
    return apiClient.get<AccountResponse>(url);
  }

  async fetchTransactions(request: FetchDataRequest): Promise<TransactionResponse> {
    return apiClient.post<TransactionResponse>(API_ENDPOINTS.TRANSACTIONS.FETCH, request);
  }

  async getTransaction(transactionId: string): Promise<TransactionResponse> {
    const url = buildUrl(API_ENDPOINTS.TRANSACTIONS.GET, { transactionId });
    return apiClient.get<TransactionResponse>(url);
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string }> {
    return apiClient.get<{ status: string }>('/health');
  }

  async getFIPs(): Promise<{ fips: Array<{ id: string; name: string }> }> {
    return apiClient.get<{ fips: Array<{ id: string; name: string }> }>('/fips');
  }
}

export const setuApi = new SetuApi(); 