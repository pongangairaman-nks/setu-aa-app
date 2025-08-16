// Environment configuration

// Environment-specific configurations
const DEV_CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  ENABLE_LOGGING: true,
  API_TIMEOUT: 30000,
};

const PROD_CONFIG = {
  API_BASE_URL: 'http://13.233.96.134:5000/api',
  ENABLE_LOGGING: false,
  API_TIMEOUT: 15000,
};

// Get current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Select configuration based on environment
const config = isProduction ? PROD_CONFIG : DEV_CONFIG;

export const ENV = {
  // Backend API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || config.API_BASE_URL,
  
  // Setu Configuration
  SETU_BASE_URL: process.env.REACT_APP_SETU_BASE_URL || 'https://fiu-uat.setu.co',
  SETU_CLIENT_ID: process.env.REACT_APP_SETU_CLIENT_ID || 'b615a43a-e779-4d95-9ddb-768c7666d96b',
  SETU_PRODUCT_ID: process.env.REACT_APP_SETU_PRODUCT_ID || 'e02807a8-2588-4306-83d2-5eb1e615abda',
  
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