// App Constants

export const APP_CONFIG = {
  NAME: 'Setu AA Mobile App',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.setu.co',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const SETU_CONFIG = {
  CLIENT_ID: process.env.EXPO_PUBLIC_SETU_CLIENT_ID || '',
  CLIENT_SECRET: process.env.EXPO_PUBLIC_SETU_CLIENT_SECRET || '',
  ENVIRONMENT: process.env.EXPO_PUBLIC_SETU_ENVIRONMENT || 'sandbox',
  WEBHOOK_URL: process.env.EXPO_PUBLIC_WEBHOOK_URL || '',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CONSENTS: 'consents',
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings',
} as const;

export const CONSENT_PERMISSIONS = {
  ACCOUNT: 'ACCOUNT',
  TRANSACTIONS: 'TRANSACTIONS',
  PROFILE: 'PROFILE',
  STATEMENTS: 'STATEMENTS',
} as const;

export const ACCOUNT_TYPES = {
  SAVINGS: 'SAVINGS',
  CURRENT: 'CURRENT',
  FIXED_DEPOSIT: 'FIXED_DEPOSIT',
  RECURRING_DEPOSIT: 'RECURRING_DEPOSIT',
  LOAN: 'LOAN',
  CREDIT_CARD: 'CREDIT_CARD',
} as const;

export const TRANSACTION_TYPES = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
} as const;

export const TRANSACTION_STATUS = {
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const CONSENT_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
  REJECTED: 'REJECTED',
} as const;

export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#6C757D',
  SUCCESS: '#28A745',
  DANGER: '#DC3545',
  WARNING: '#FFC107',
  INFO: '#17A2B8',
  LIGHT: '#F8F9FA',
  DARK: '#343A40',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#6C757D',
  LIGHT_GRAY: '#E9ECEF',
} as const;

export const FONTS = {
  REGULAR: 'System',
  MEDIUM: 'System',
  BOLD: 'System',
  LIGHT: 'System',
} as const;

export const SIZES = {
  XS: 8,
  SM: 12,
  MD: 16,
  LG: 20,
  XL: 24,
  XXL: 32,
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  ROUND: 50,
} as const;

export const SHADOWS = {
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
} as const; 