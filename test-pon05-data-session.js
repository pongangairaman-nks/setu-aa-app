const axios = require('axios');

async function testPon05DataSession() {
  console.log('🔄 Testing Data Session for pon05@gmail.com');
  console.log('===========================================');
  
  const pon05ConsentId = "c603922b-0521-47d3-a006-cbc14d18b982";
  
  console.log('📋 pon05@gmail.com Consent ID:', pon05ConsentId);
  console.log('');
  
  try {
    // Step 1: Login to get token
    console.log('🔐 Step 1: Logging in with pon05@gmail.com...');
    const loginResponse = await axios.post('https://hedgrpay.com/api/auth/login', {
      email: 'pon05@gmail.com',
      password: 'Pass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Create data session
    console.log('🔄 Step 2: Creating data session...');
    const dataSessionResponse = await axios.post('https://hedgrpay.com/api/setu/sessions', {
      consentId: pon05ConsentId,
      dataRange: {
        from: "2025-06-10T00:00:00.000Z",
        to: "2025-06-20T00:00:00.000Z"
      },
      format: "json"
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Data session created successfully!');
    console.log('📄 Response:', JSON.stringify(dataSessionResponse.data, null, 2));
    
    const dataSessionId = dataSessionResponse.data.id;
    console.log('🆔 Data Session ID:', dataSessionId);
    
    // Step 3: Wait a moment and then trigger webhook
    console.log('⏳ Step 3: Waiting 5 seconds for data processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 4: Send webhook for completed session
    console.log('🔄 Step 4: Sending COMPLETED webhook...');
    const webhookPayload = {
      type: "SESSION_STATUS_UPDATE",
      consentId: pon05ConsentId,
      dataSessionId: dataSessionId,
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        status: "COMPLETED",
        sessionHandle: dataSessionId,
        fiTypes: ["DEPOSIT", "MUTUAL_FUNDS"],
        dataLife: {
          unit: "MONTH",
          value: 6
        }
      },
      signature: "test-signature-pon05"
    };
    
    const webhookResponse = await axios.post('https://hedgrpay.com/api/webhooks/setu', webhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Setu-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Webhook sent successfully!');
    console.log('📊 Status:', webhookResponse.status);
    console.log('📄 Response:', JSON.stringify(webhookResponse.data, null, 2));
    
    // Step 5: Wait and check user data
    console.log('⏳ Step 5: Waiting 3 seconds for webhook processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 6: Check updated user data
    console.log('👤 Step 6: Checking updated user data...');
    const userResponse = await axios.get('https://hedgrpay.com/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const userData = userResponse.data;
    console.log('✅ Updated user data:');
    console.log('🏦 Accounts Count:', userData.accounts ? userData.accounts.length : 0);
    console.log('💳 Transactions Count:', userData.transactions ? userData.transactions.length : 0);
    console.log('📋 Profile:', userData.profile ? 'Present' : 'Missing');
    
    if (userData.accounts && userData.accounts.length > 0) {
      console.log('🏦 First Account:', JSON.stringify(userData.accounts[0], null, 2));
    }
    
    if (userData.transactions && userData.transactions.length > 0) {
      console.log('💳 First Transaction:', JSON.stringify(userData.transactions[0], null, 2));
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📄 Response:', error.response.data);
    }
  }
}

async function main() {
  console.log('🚀 Testing pon05@gmail.com Data Session Flow');
  console.log('==========================================');
  
  await testPon05DataSession();
  
  console.log('');
  console.log('🎉 Testing completed!');
}

// Run the tests
main().catch(console.error);
