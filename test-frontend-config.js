#!/usr/bin/env node

/**
 * Frontend Configuration Test Script
 * Tests backend connectivity and configuration
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://13.233.96.134:5000';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

// Test results
const testResults = {
  backend: false,
  setu: false,
  webhook: false,
  total: 0,
  passed: 0,
};

async function testBackendHealth() {
  log.info('Testing backend health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 10000,
    });
    
    if (response.status === 200 && response.data.success) {
      testResults.backend = true;
      testResults.passed++;
      log.success('Backend health check passed');
      log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      log.error('Backend health check failed - unexpected response');
    }
  } catch (error) {
    log.error(`Backend health check failed: ${error.message}`);
    if (error.code === 'ECONNABORTED') {
      log.warning('Request timed out - check your internet connection');
    } else if (error.code === 'ENOTFOUND') {
      log.warning('Could not resolve host - check the backend URL');
    }
  }
  testResults.total++;
}

async function testSetuConfiguration() {
  log.info('Testing Setu configuration...');
  try {
    const response = await axios.get(`${BACKEND_URL}/test-setu`, {
      timeout: 10000,
    });
    
    if (response.status === 200 && response.data.success) {
      testResults.setu = true;
      testResults.passed++;
      log.success('Setu configuration test passed');
      
      const config = response.data.config;
      log.info('Setu Configuration Status:');
      Object.entries(config).forEach(([key, value]) => {
        const status = value === 'Configured' || value === 'Success' ? '✅' : '❌';
        log.info(`  ${status} ${key}: ${value}`);
      });
    } else {
      log.error('Setu configuration test failed - unexpected response');
    }
  } catch (error) {
    log.error(`Setu configuration test failed: ${error.message}`);
  }
  testResults.total++;
}

async function testWebhookEndpoint() {
  log.info('Testing webhook endpoint...');
  try {
    const testPayload = {
      type: 'CONSENT_STATUS_UPDATE',
      consentId: 'test-frontend-config',
      success: true,
      data: { status: 'ACTIVE' },
      timestamp: new Date().toISOString(),
    };
    
    const response = await axios.post(`${API_BASE_URL}/webhooks/setu`, testPayload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 200 && response.data.success) {
      testResults.webhook = true;
      testResults.passed++;
      log.success('Webhook endpoint test passed');
    } else {
      log.error('Webhook endpoint test failed - unexpected response');
    }
  } catch (error) {
    log.error(`Webhook endpoint test failed: ${error.message}`);
    if (error.response?.status === 401) {
      log.warning('Unauthorized - check webhook signature configuration');
    } else if (error.response?.status === 404) {
      log.warning('Endpoint not found - check webhook route configuration');
    }
  }
  testResults.total++;
}

async function testApiEndpoints() {
  log.info('Testing API endpoints...');
  
  const endpoints = [
    { name: 'Consents API', url: `${API_BASE_URL}/consents` },
    { name: 'Accounts API', url: `${API_BASE_URL}/accounts` },
    { name: 'Transactions API', url: `${API_BASE_URL}/transactions` },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url, {
        timeout: 5000,
      });
      
      // We expect these to return some response (even if empty)
      if (response.status === 200) {
        log.success(`${endpoint.name} is accessible`);
      } else {
        log.warning(`${endpoint.name} returned status ${response.status}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        log.warning(`${endpoint.name} not found (expected for empty endpoints)`);
      } else {
        log.error(`${endpoint.name} error: ${error.message}`);
      }
    }
  }
}

function printSummary() {
  log.title('\n📊 Test Summary');
  log.info(`Backend Health: ${testResults.backend ? '✅ PASS' : '❌ FAIL'}`);
  log.info(`Setu Config: ${testResults.setu ? '✅ PASS' : '❌ FAIL'}`);
  log.info(`Webhook Endpoint: ${testResults.webhook ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n' + '='.repeat(50));
  log.title(`Results: ${testResults.passed}/${testResults.total} tests passed`);
  
  if (testResults.passed === testResults.total) {
    log.success('🎉 All tests passed! Your frontend is ready for production.');
  } else {
    log.error('⚠️  Some tests failed. Please check your configuration.');
  }
  
  console.log('\n' + '='.repeat(50));
  log.info('Frontend Configuration:');
  log.info(`  Backend URL: ${BACKEND_URL}`);
  log.info(`  API Base URL: ${API_BASE_URL}`);
  log.info(`  Webhook URL: ${API_BASE_URL}/webhooks/setu`);
}

async function runAllTests() {
  log.title('🧪 Frontend Configuration Test Suite');
  log.info('Testing connectivity to production backend...\n');
  
  await testBackendHealth();
  console.log('');
  
  await testSetuConfiguration();
  console.log('');
  
  await testWebhookEndpoint();
  console.log('');
  
  await testApiEndpoints();
  console.log('');
  
  printSummary();
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testBackendHealth,
  testSetuConfiguration,
  testWebhookEndpoint,
  testApiEndpoints,
  runAllTests,
};
