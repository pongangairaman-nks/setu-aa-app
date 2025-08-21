const axios = require('axios');

async function testWebhookDirect() {
  console.log('🔄 Testing Webhook Endpoint Directly');
  console.log('====================================');
  
  // Test webhook endpoint with a sample consent webhook payload
  const consentWebhookPayload = {
    type: "CONSENT_STATUS_UPDATE",
    consentId: "test-consent-id-123",
    timestamp: new Date().toISOString(),
    success: true,
    data: {
      status: "ACTIVE",
      consentHandle: "test-consent-handle",
      fiTypes: ["DEPOSIT", "MUTUAL_FUNDS"],
      dataLife: {
        unit: "MONTH",
        value: 6
      }
    },
    signature: "test-signature-123"
  };
  
  console.log('📤 Sending consent webhook payload:');
  console.log(JSON.stringify(consentWebhookPayload, null, 2));
  console.log('');
  
  try {
    const response = await axios.post('https://hedgrpay.com/api/webhooks/setu', consentWebhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Setu-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Webhook sent successfully!');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Webhook failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
  
  console.log('');
  console.log('🔄 Testing Data Session Webhook');
  console.log('===============================');
  
  // Test data session webhook
  const dataSessionWebhookPayload = {
    type: "SESSION_STATUS_UPDATE",
    consentId: "test-consent-id-123",
    dataSessionId: "test-session-id-456",
    timestamp: new Date().toISOString(),
    success: true,
    data: {
      status: "COMPLETED",
      sessionHandle: "test-session-handle",
      fiTypes: ["DEPOSIT", "MUTUAL_FUNDS"],
      dataLife: {
        unit: "MONTH",
        value: 6
      }
    },
    signature: "test-signature-456"
  };
  
  console.log('📤 Sending data session webhook payload:');
  console.log(JSON.stringify(dataSessionWebhookPayload, null, 2));
  console.log('');
  
  try {
    const response = await axios.post('https://hedgrpay.com/api/webhooks/setu', dataSessionWebhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Setu-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Data session webhook sent successfully!');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Data session webhook failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
}

async function testWithActualConsentId() {
  console.log('');
  console.log('🎯 Testing with Actual Consent ID');
  console.log('=================================');
  
  // You can replace this with your actual consent ID
  const actualConsentId = "your-actual-consent-id-here";
  
  if (actualConsentId === "your-actual-consent-id-here") {
    console.log('⚠️  Please provide your actual consent ID to test with real data');
    console.log('📝 Update the actualConsentId variable in this script');
    return;
  }
  
  const actualConsentWebhook = {
    type: "CONSENT_STATUS_UPDATE",
    consentId: actualConsentId,
    timestamp: new Date().toISOString(),
    success: true,
    data: {
      status: "ACTIVE",
      consentHandle: actualConsentId,
      fiTypes: ["DEPOSIT", "MUTUAL_FUNDS"],
      dataLife: {
        unit: "MONTH",
        value: 6
      }
    },
    signature: "actual-signature"
  };
  
  console.log('📤 Sending actual consent webhook:');
  console.log(JSON.stringify(actualConsentWebhook, null, 2));
  
  try {
    const response = await axios.post('https://hedgrpay.com/api/webhooks/setu', actualConsentWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Setu-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Actual consent webhook successful!');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Actual consent webhook failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Webhook Tests');
  console.log('=========================');
  
  await testWebhookDirect();
  await testWithActualConsentId();
  
  console.log('');
  console.log('🎉 Webhook tests completed!');
}

// Run the tests
main().catch(console.error);
