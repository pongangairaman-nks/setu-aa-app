const axios = require('axios');

async function testActualWebhook() {
  console.log('🔄 Testing Webhook with Actual Data');
  console.log('===================================');
  
  // Your actual consent and data session IDs
  const actualConsentId = "c603922b-0521-47d3-a006-cbc14d18b982";
  const actualDataSessionId = "feffb0d1-3424-4f1f-866f-f433f4f53552";
  
  console.log('📋 Actual IDs:');
  console.log('- Consent ID:', actualConsentId);
  console.log('- Data Session ID:', actualDataSessionId);
  console.log('');
  
  // Test 1: Consent Status Update Webhook
  console.log('🔄 Test 1: Consent Status Update Webhook');
  console.log('========================================');
  
  const consentWebhook = {
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
    signature: "test-signature-consent"
  };
  
  console.log('📤 Sending consent webhook:');
  console.log(JSON.stringify(consentWebhook, null, 2));
  console.log('');
  
  try {
    const consentResponse = await axios.post('https://hedgrpay.com/api/webhooks/setu', consentWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Setu-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Consent webhook response:');
    console.log('📊 Status:', consentResponse.status);
    console.log('📄 Response:', JSON.stringify(consentResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Consent webhook failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
  
  console.log('');
  console.log('🔄 Test 2: Data Session Status Update Webhook');
  console.log('=============================================');
  
  // Test 2: Data Session Status Update Webhook (COMPLETED)
  const dataSessionWebhook = {
    type: "SESSION_STATUS_UPDATE",
    consentId: actualConsentId,
    dataSessionId: actualDataSessionId,
    timestamp: new Date().toISOString(),
    success: true,
    data: {
      status: "COMPLETED",
      sessionHandle: actualDataSessionId,
      fiTypes: ["DEPOSIT", "MUTUAL_FUNDS"],
      dataLife: {
        unit: "MONTH",
        value: 6
      }
    },
    signature: "test-signature-session"
  };
  
  console.log('📤 Sending data session webhook (COMPLETED):');
  console.log(JSON.stringify(dataSessionWebhook, null, 2));
  console.log('');
  
  try {
    const sessionResponse = await axios.post('https://hedgrpay.com/api/webhooks/setu', dataSessionWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Setu-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Data session webhook response:');
    console.log('📊 Status:', sessionResponse.status);
    console.log('📄 Response:', JSON.stringify(sessionResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Data session webhook failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
  
  console.log('');
  console.log('🔄 Test 3: Check User Data After Webhook');
  console.log('========================================');
  
  // Test 3: Check if user data was updated
  try {
    // First get a fresh token
    const loginResponse = await axios.post('https://hedgrpay.com/api/auth/login', {
      email: 'pon04@gmail.com',
      password: 'Pass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const token = loginResponse.data.token;
    
    // Check user accounts
    console.log('🏦 Checking user accounts...');
    const accountsResponse = await axios.get('https://hedgrpay.com/api/accounts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Accounts response:');
    console.log('📊 Status:', accountsResponse.status);
    console.log('📄 Accounts:', JSON.stringify(accountsResponse.data, null, 2));
    
    // Check user transactions
    console.log('💳 Checking user transactions...');
    const transactionsResponse = await axios.get('https://hedgrpay.com/api/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Transactions response:');
    console.log('📊 Status:', transactionsResponse.status);
    console.log('📄 Transactions:', JSON.stringify(transactionsResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ User data check failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
}

async function main() {
  console.log('🚀 Testing Complete Webhook Flow');
  console.log('================================');
  
  await testActualWebhook();
  
  console.log('');
  console.log('🎉 Webhook testing completed!');
}

// Run the tests
main().catch(console.error);
