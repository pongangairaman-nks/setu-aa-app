const fs = require('fs');
const path = require('path');

// Configuration
const LOG_DIR = path.join(__dirname, 'backend/logs');
const COMBINED_LOG = path.join(LOG_DIR, 'combined.log');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');

console.log('🔍 Webhook Monitor Started');
console.log('==========================');
console.log(`📁 Monitoring logs in: ${LOG_DIR}`);
console.log(`📄 Combined log: ${COMBINED_LOG}`);
console.log(`❌ Error log: ${ERROR_LOG}`);
console.log('');

// Function to monitor log files
function monitorLogs() {
  console.log('⏳ Waiting for webhook requests...');
  console.log('Press Ctrl+C to stop monitoring');
  console.log('');

  // Monitor combined log for webhook entries
  const combinedWatcher = fs.watch(COMBINED_LOG, (eventType, filename) => {
    if (eventType === 'change') {
      // Read the last few lines to see new entries
      const stats = fs.statSync(COMBINED_LOG);
      const buffer = Buffer.alloc(1024);
      const fd = fs.openSync(COMBINED_LOG, 'r');
      const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, stats.size - buffer.length);
      fs.closeSync(fd);
      
      const newContent = buffer.toString('utf8', 0, bytesRead);
      const lines = newContent.split('\n').filter(line => line.trim());
      
      // Look for webhook-related entries
      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          if (logEntry.message && logEntry.message.includes('WEBHOOK')) {
            console.log('🔄 ===== NEW WEBHOOK ENTRY =====');
            console.log('⏰ Timestamp:', logEntry.timestamp);
            console.log('📝 Message:', logEntry.message);
            if (logEntry.level) {
              console.log('📊 Level:', logEntry.level.replace(/\u001b\[[0-9;]*m/g, ''));
            }
            console.log('================================');
            console.log('');
          }
        } catch (e) {
          // Skip non-JSON lines
        }
      });
    }
  });

  // Monitor error log for webhook errors
  const errorWatcher = fs.watch(ERROR_LOG, (eventType, filename) => {
    if (eventType === 'change') {
      // Read the last few lines to see new error entries
      const stats = fs.statSync(ERROR_LOG);
      const buffer = Buffer.alloc(1024);
      const fd = fs.openSync(ERROR_LOG, 'r');
      const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, stats.size - buffer.length);
      fs.closeSync(fd);
      
      const newContent = buffer.toString('utf8', 0, bytesRead);
      const lines = newContent.split('\n').filter(line => line.trim());
      
      // Look for webhook-related errors
      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          if (logEntry.message && logEntry.message.includes('webhook')) {
            console.log('❌ ===== WEBHOOK ERROR =====');
            console.log('⏰ Timestamp:', logEntry.timestamp);
            console.log('📝 Message:', logEntry.message);
            if (logEntry.stack) {
              console.log('🔍 Stack:', logEntry.stack);
            }
            console.log('============================');
            console.log('');
          }
        } catch (e) {
          // Skip non-JSON lines
        }
      });
    }
  });

  // Handle cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping webhook monitor...');
    combinedWatcher.close();
    errorWatcher.close();
    process.exit(0);
  });
}

// Function to show recent webhook entries
function showRecentWebhooks() {
  console.log('📋 Recent Webhook Entries:');
  console.log('==========================');
  
  try {
    const combinedContent = fs.readFileSync(COMBINED_LOG, 'utf8');
    const lines = combinedContent.split('\n').filter(line => line.trim());
    
    // Get last 50 lines and filter for webhook entries
    const recentLines = lines.slice(-50);
    const webhookEntries = [];
    
    recentLines.forEach(line => {
      try {
        const logEntry = JSON.parse(line);
        if (logEntry.message && logEntry.message.includes('WEBHOOK')) {
          webhookEntries.push({
            timestamp: logEntry.timestamp,
            message: logEntry.message,
            level: logEntry.level ? logEntry.level.replace(/\u001b\[[0-9;]*m/g, '') : 'info'
          });
        }
      } catch (e) {
        // Skip non-JSON lines
      }
    });
    
    if (webhookEntries.length === 0) {
      console.log('❌ No recent webhook entries found');
    } else {
      webhookEntries.forEach((entry, index) => {
        console.log(`${index + 1}. [${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`);
      });
    }
  } catch (error) {
    console.log('❌ Error reading log files:', error.message);
  }
  
  console.log('');
}

// Function to test webhook endpoint
function testWebhookEndpoint() {
  console.log('🧪 Testing Webhook Endpoint:');
  console.log('============================');
  
  const testPayload = {
    data: {
      status: "COMPLETED",
      fips: [
        {
          accounts: [
            {
              FIStatus: "READY",
              description: "Test account status",
              linkRefNumber: "test-link-ref-123"
            }
          ],
          fipID: "setu-fip"
        }
      ],
      format: "json"
    },
    timestamp: new Date().toISOString(),
    dataSessionId: "test-session-456",
    success: true,
    type: "SESSION_STATUS_UPDATE",
    error: null,
    consentId: "f3801e5b-b8e0-408a-ae76-e07f5757912d"
  };
  
  console.log('📦 Test Payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('');
  console.log('🌐 To test, send this payload to:');
  console.log('   POST https://hedgrpay.com/api/webhooks/setu');
  console.log('   Content-Type: application/json');
  console.log('');
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--recent')) {
    showRecentWebhooks();
  } else if (args.includes('--test')) {
    testWebhookEndpoint();
  } else if (args.includes('--monitor')) {
    monitorLogs();
  } else {
    console.log('🔍 Webhook Monitor - Usage:');
    console.log('==========================');
    console.log('node monitor-webhooks.js --recent  # Show recent webhook entries');
    console.log('node monitor-webhooks.js --test    # Show test payload');
    console.log('node monitor-webhooks.js --monitor # Monitor in real-time');
    console.log('');
    
    // Default: show recent entries
    showRecentWebhooks();
  }
}

// Run the script
main();
