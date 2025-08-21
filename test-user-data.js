const axios = require('axios');

async function testUserData() {
  console.log('👤 Testing User Data via auth/me');
  console.log('================================');
  
  try {
    // Step 1: Login to get token
    console.log('🔐 Step 1: Logging in...');
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
    console.log('✅ Login successful, token received');
    
    // Step 2: Get user data via auth/me
    console.log('👤 Step 2: Fetching user data via auth/me...');
    const userResponse = await axios.get('https://hedgrpay.com/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ User data response:');
    console.log('📊 Status:', userResponse.status);
    console.log('📄 User Data:', JSON.stringify(userResponse.data, null, 2));
    
    // Step 3: Analyze the data structure
    console.log('');
    console.log('🔍 Data Analysis:');
    console.log('================');
    
    const userData = userResponse.data;
    
    if (userData.user) {
      const user = userData.user;
      
      console.log('👤 User Profile:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- Created At:', user.createdAt);
      
      // Check for profile data
      if (user.profile) {
        console.log('📋 Profile Data:');
        console.log('- Profile exists:', !!user.profile);
        console.log('- Profile details:', JSON.stringify(user.profile, null, 2));
      } else {
        console.log('❌ No profile data found');
      }
      
      // Check for accounts data
      if (user.accounts && Array.isArray(user.accounts)) {
        console.log('🏦 Accounts Data:');
        console.log('- Number of accounts:', user.accounts.length);
        if (user.accounts.length > 0) {
          console.log('- First account:', JSON.stringify(user.accounts[0], null, 2));
        }
      } else {
        console.log('❌ No accounts data found');
      }
      
      // Check for transactions data
      if (user.transactions && Array.isArray(user.transactions)) {
        console.log('💳 Transactions Data:');
        console.log('- Number of transactions:', user.transactions.length);
        if (user.transactions.length > 0) {
          console.log('- First transaction:', JSON.stringify(user.transactions[0], null, 2));
        }
      } else {
        console.log('❌ No transactions data found');
      }
      
      // Check for consent details
      if (user.consentDetails) {
        console.log('📋 Consent Details:');
        console.log('- Consent details:', JSON.stringify(user.consentDetails, null, 2));
      } else {
        console.log('❌ No consent details found');
      }
      
    } else {
      console.log('❌ No user data in response');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📄 Response:', error.response.data);
    }
  }
}

async function testWebhookTrigger() {
  console.log('');
  console.log('🔄 Testing Webhook Trigger');
  console.log('==========================');
  
  // Your actual consent and data session IDs
  const actualConsentId = "c603922b-0521-47d3-a006-cbc14d18b982";
  const actualDataSessionId = "feffb0d1-3424-4f1f-866f-f433f4f53552";
  
  console.log('📤 Sending COMPLETED data session webhook...');
  
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
  
  try {
    const response = await axios.post('https://hedgrpay.com/api/webhooks/setu', dataSessionWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Setu-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Webhook sent successfully');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    
    // Wait a moment for processing
    console.log('⏳ Waiting 3 seconds for webhook processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test user data again
    console.log('🔄 Testing user data again after webhook...');
    await testUserData();
    
  } catch (error) {
    console.log('❌ Webhook failed:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📄 Response:', error.response.data);
    }
  }
}

async function main() {
  console.log('🚀 Testing User Data Storage');
  console.log('============================');
  
  await testUserData();
  await testWebhookTrigger();
  
  console.log('');
  console.log('🎉 Testing completed!');
}

// Run the tests
main().catch(console.error);
