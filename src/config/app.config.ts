import { APP_CONFIG, API_CONFIG, SETU_CONFIG } from '../utils/constants';

export interface AppConfig {
  name: string;
  version: string;
  buildNumber: string;
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  setu: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
    webhookUrl: string;
  };
  features: {
    enablePushNotifications: boolean;
    enableBiometrics: boolean;
    enableOfflineMode: boolean;
    enableAnalytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
}

export const appConfig: AppConfig = {
  name: APP_CONFIG.NAME,
  version: APP_CONFIG.VERSION,
  buildNumber: APP_CONFIG.BUILD_NUMBER,
  api: {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
    retryDelay: API_CONFIG.RETRY_DELAY,
  },
  setu: {
    clientId: SETU_CONFIG.CLIENT_ID,
    clientSecret: SETU_CONFIG.CLIENT_SECRET,
    environment: SETU_CONFIG.ENVIRONMENT as 'sandbox' | 'production',
    webhookUrl: SETU_CONFIG.WEBHOOK_URL,
  },
  features: {
    enablePushNotifications: true,
    enableBiometrics: true,
    enableOfflineMode: true,
    enableAnalytics: true,
  },
  ui: {
    theme: 'light',
    language: 'en',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
};

export const getConfig = (): AppConfig => {
  return appConfig;
};

export const updateConfig = (updates: Partial<AppConfig>): void => {
  Object.assign(appConfig, updates);
}; 