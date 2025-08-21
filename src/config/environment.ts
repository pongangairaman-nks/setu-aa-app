// Environment configuration

// Environment-specific configurations
const DEV_CONFIG = {
  API_BASE_URL: 'https://hedgrpay.com/api',
  SETU_API_BASE_URL: 'https://fiu-sandbox.setu.co', // Sandbox environment
  ENABLE_LOGGING: true,
  API_TIMEOUT: 30000,
};

const PROD_CONFIG = {
  API_BASE_URL: 'https://hedgrpay.com/api',
  SETU_API_BASE_URL: 'https://fiu-sandbox.setu.co', // Sandbox environment
  ENABLE_LOGGING: false,
  API_TIMEOUT: 15000,
};

// Get current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Select configuration based on environment
const config = isProduction ? PROD_CONFIG : DEV_CONFIG;

export const ENV = {
  // Backend API Configuration (for webhooks and other operations)
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || config.API_BASE_URL,
  
  // Setu API Configuration (direct to Setu)
  SETU_API_BASE_URL: process.env.REACT_APP_SETU_API_BASE_URL || config.SETU_API_BASE_URL,
  SETU_BASE_URL: process.env.REACT_APP_SETU_BASE_URL || 'https://fiu-sandbox.setu.co', // Sandbox
  SETU_CLIENT_ID: process.env.REACT_APP_SETU_CLIENT_ID || '5b2642c9-dfd8-4457-90fb-6f495d53cdd6',
  SETU_CLIENT_SECRET: process.env.REACT_APP_SETU_CLIENT_SECRET || 'Ft6D9OpEKoyK1cg8okFdRZWIXvdYv8Zu',
  SETU_PRODUCT_ID: process.env.REACT_APP_SETU_PRODUCT_ID || 'd0bcfcab-38f4-4723-8390-55355b1f0627',
  
  // App Configuration
  APP_NAME: process.env.REACT_APP_APP_NAME || 'Setu AA Mobile App',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
  
  // Features
  ENABLE_LOGGING: process.env.REACT_APP_ENABLE_LOGGING !== 'false' && config.ENABLE_LOGGING,
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  
  // Timeouts
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || config.API_TIMEOUT.toString()),
  REQUEST_TIMEOUT: parseInt(process.env.REACT_APP_REQUEST_TIMEOUT || '10000'),
  
  // Data Retention
  DATA_RETENTION_DAYS: parseInt(process.env.REACT_APP_DATA_RETENTION_DAYS || '180'),
}; 