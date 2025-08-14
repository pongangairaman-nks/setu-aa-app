import { ENV } from './environment';

export const SETU_CONFIG = {
  // Base Configuration
  BASE_URL: ENV.SETU_BASE_URL,
  CLIENT_ID: ENV.SETU_CLIENT_ID,
  PRODUCT_ID: ENV.SETU_PRODUCT_ID,
  
  // API Endpoints
  ENDPOINTS: {
    CONSENT: '/consents',
    DATA_FETCH: '/data/fetch',
    FI_TYPES: '/fi-types',
  },
  
  // Default Settings
  DEFAULTS: {
    DATA_LIFE_DAYS: 180, // 6 months
    FETCH_TYPE: 'PERIODIC',
    FREQUENCY: {
      unit: 'MONTH',
      value: 1
    },
    PERMISSIONS: ['ACCOUNT', 'TRANSACTIONS'],
    CONSENT_MODE: 'STORE',
    PURPOSE: {
      code: '101',
      refUri: 'https://api.rebit.org.in/consent/purpose/101.xml',
      text: 'Wealth management service'
    }
  },
  
  // Timeouts
  TIMEOUTS: {
    REQUEST: 30000,
    CONSENT_POLL: 5000,
    MAX_RETRIES: 3
  },
  
  // Webhook Configuration
  WEBHOOK: {
    EVENTS: ['CONSENT', 'DATA', 'PERIODIC_REFRESH', 'CONSENT_EXPIRY'],
    VERIFICATION: true
  },
  
  // Error Codes
  ERROR_CODES: {
    CONSENT_CREATION_FAILED: 'CONSENT_CREATION_FAILED',
    CONSENT_NOT_FOUND: 'CONSENT_NOT_FOUND',
    DATA_FETCH_FAILED: 'DATA_FETCH_FAILED',
    INVALID_SIGNATURE: 'INVALID_SIGNATURE',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
  }
};

export const getSetuConfig = () => SETU_CONFIG;

export const getSetuEndpoint = (endpoint: keyof typeof SETU_CONFIG.ENDPOINTS) => {
  return `${SETU_CONFIG.BASE_URL}${SETU_CONFIG.ENDPOINTS[endpoint]}`;
}; 