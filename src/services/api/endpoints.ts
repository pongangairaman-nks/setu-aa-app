export const API_ENDPOINTS = {
  // Setu API endpoints (direct to Setu)
  CONSENT: {
    CREATE: '/consents', // POST /consents
    GET: '/consents/{consentId}', // GET /consents/:id
    UPDATE: '/consents/{consentId}', // PUT /consents/:id (if supported)
    REVOKE: '/consents/{consentId}/revoke', // POST /consents/:id/revoke
    STATUS: '/consents/{consentId}', // GET /consents/:id (same as GET)
    FETCH_STATUS: '/consents/{consentId}/fetch/status', // GET /consents/:id/fetch/status
    DATA_SESSIONS: '/consents/{consentId}/data-sessions', // GET /consents/:id/data-sessions
  },
  
  // Multi consent endpoints
  MULTI_CONSENT: {
    CREATE: '/consents/collection', // POST /consents/collection
  },
  
  // Data fetching endpoints
  DATA: {
    FETCH: '/data/fetch', // POST /data/fetch
    SESSIONS: '/data/sessions', // GET /data/sessions
  },
  
  // FIP endpoints
  FIPS: {
    LIST: '/fips', // GET /fips
  },
  
  // Authentication endpoints (if needed)
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  
  // Webhook endpoints (your backend)
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