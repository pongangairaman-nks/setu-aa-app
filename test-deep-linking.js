#!/usr/bin/env node

/**
 * Deep Linking Test Script
 * Tests Setu callback URL handling
 */

const { exec } = require('child_process');
const os = require('os');

// Test URLs
const testUrls = [
  {
    name: 'Success Callback',
    url: 'setu-aa-app://consent-callback?consentId=test-success-123&status=ACTIVE',
    description: 'Tests successful consent approval'
  },
  {
    name: 'Error Callback',
    url: 'setu-aa-app://consent-callback?consentId=test-error-123&error=UserCancelled&error_message=cancel_not_understand',
    description: 'Tests user cancellation scenario'
  },
  {
    name: 'Rejection Callback',
    url: 'setu-aa-app://consent-callback?consentId=test-rejection-123&status=REJECTED',
    description: 'Tests consent rejection scenario'
  },
  {
    name: 'Invalid Callback',
    url: 'setu-aa-app://consent-callback?consentId=test-invalid-123',
    description: 'Tests callback without status or error'
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

function detectPlatform() {
  const platform = os.platform();
  if (platform === 'darwin') {
    return 'ios';
  } else if (platform === 'win32') {
    return 'android';
  } else {
    return 'android';
  }
}

function openDeepLink(url, platform) {
  return new Promise((resolve, reject) => {
    let command;
    
    if (platform === 'ios') {
      // iOS Simulator
      command = `xcrun simctl openurl booted "${url}"`;
    } else {
      // Android Emulator (you'll need to replace with your package name)
      const packageName = 'com.your.setuaaapp'; // Replace with your actual package name
      command = `adb shell am start -W -a android.intent.action.VIEW -d "${url}" ${packageName}`;
    }
    
    log.info(`Testing: ${url}`);
    log.info(`Command: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        log.warning(`Command failed: ${error.message}`);
        log.info('This is expected if no simulator/emulator is running');
        resolve({ success: false, error: error.message });
      } else {
        log.success(`Deep link opened successfully`);
        resolve({ success: true, output: stdout });
      }
    });
  });
}

async function testDeepLinks() {
  log.title('🔗 Deep Linking Test Suite');
  log.info('Testing Setu callback URL handling...\n');
  
  const platform = detectPlatform();
  log.info(`Detected platform: ${platform}`);
  log.info('Note: Make sure your app is running in simulator/emulator\n');
  
  for (const test of testUrls) {
    log.title(`\n🧪 ${test.name}`);
    log.info(test.description);
    
    try {
      const result = await openDeepLink(test.url, platform);
      
      if (result.success) {
        log.success(`${test.name} - Deep link opened successfully`);
      } else {
        log.warning(`${test.name} - Command failed (expected if no simulator running)`);
      }
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      log.error(`${test.name} - Error: ${error.message}`);
    }
  }
  
  log.title('\n📋 Test Summary');
  log.info('Deep linking tests completed!');
  log.info('\nTo test manually:');
  log.info('1. Start your app in simulator/emulator');
  log.info('2. Run: npm start');
  log.info('3. Open these URLs in browser:');
  
  testUrls.forEach(test => {
    log.info(`   ${test.url}`);
  });
  
  log.info('\nExpected behavior:');
  log.info('✅ App should open and navigate to ConsentCallbackScreen');
  log.info('✅ Appropriate message should be displayed');
  log.info('✅ Navigation should work correctly');
}

// Run tests if this script is executed directly
if (require.main === module) {
  testDeepLinks().catch((error) => {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testDeepLinks,
  openDeepLink,
  detectPlatform
};
