export const API_ENDPOINTS = {
  // Backend API endpoints (proxy to Setu)
  CONSENT: {
    CREATE: '/consents/create',
    GET: '/consents/{consentId}',
    UPDATE: '/consents/{consentId}',
    REVOKE: '/consents/{consentId}',
    STATUS: '/consents/{consentId}/status',
  },
  
  ACCOUNTS: {
    FETCH: '/accounts/fetch',
    GET: '/accounts/{accountId}',
  },
  
  TRANSACTIONS: {
    FETCH: '/transactions/fetch',
    GET: '/transactions/{transactionId}',
  },
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  
  // Webhook endpoints
  WEBHOOK: {
    CONSENT: '/webhooks/consent',
    DATA: '/webhooks/data',
  },
} as const;

export const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = endpoint;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });
  }
  
  return url;
}; 