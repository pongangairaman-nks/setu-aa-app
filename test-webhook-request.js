const axios = require('axios');

// Test webhook payload
const testWebhookPayload = {
  data: {
    status: "COMPLETED",
    fips: [
      {
        accounts: [
          {
            FIStatus: "READY",
            description: "Test account status from script",
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

async function testWebhook() {
  console.log('🧪 Testing Webhook Endpoint');
  console.log('============================');
  console.log('📦 Sending payload:');
  console.log(JSON.stringify(testWebhookPayload, null, 2));
  console.log('');
  
  try {
    const response = await axios.post('https://hedgrpay.com/api/webhooks/setu', testWebhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Webhook sent successfully!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error sending webhook:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
}

// Run the test
testWebhook();
