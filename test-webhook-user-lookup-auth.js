const https = require('https');

// Function to make HTTPS request with auth
function makeAuthenticatedRequest(url, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Function to make webhook request (no auth needed)
function makeWebhookRequest(url, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testWebhookUserLookupWithAuth() {
  try {
    console.log('🔍 Testing Webhook User Lookup with Authentication...\n');

    // Your JWT token from the app
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE0YWZlZjU1OWVmNDM3ZDQ1OTA0YjEiLCJlbWFpbCI6InBvbjAzQGdtYWlsLmNvbSIsImlhdCI6MTc1NTcyMTA5OSwiZXhwIjoxNzU1ODA3NDk5fQ.kVXTcFoQlHRr7VGmO_hg7zOEIHwG_bHvKUbERtQjC8E';
    const consentId = '0927eee7-2b83-47cd-8bd2-791efb417ecf';
    const sessionId = '4422328f-5ee4-439a-89df-cbfb6795295c';

    console.log('1. Checking initial user data...\n');

    const initialUserData = await makeAuthenticatedRequest(
      'https://hedgrpay.com/api/setu/user-data',
      'GET',
      null,
      token
    );
    
    console.log(`   📊 Initial User Data:`);
    console.log(`     Status: ${initialUserData.statusCode}`);
    
    if (initialUserData.statusCode === 200) {
      const userData = JSON.parse(initialUserData.data);
      console.log(`     Accounts: ${userData.data.accounts.length}`);
      console.log(`     Transactions: ${userData.data.transactions.length}`);
      console.log(`     Profile: ${userData.data.profile ? 'Present' : 'Null'}\n`);
    }

    console.log('2. Testing webhook with detailed logging...\n');

    // Create a webhook payload that should trigger detailed processing
    const webhookData = {
      type: 'SESSION_STATUS_UPDATE',
      data: {
        status: 'COMPLETED',
        sessionId: sessionId
      },
      consentId: consentId,
      success: true,
      timestamp: new Date().toISOString()
    };

    console.log(`   📤 Sending webhook with:`);
    console.log(`     Consent ID: ${consentId}`);
    console.log(`     Session ID: ${sessionId}`);
    console.log(`     Status: COMPLETED\n`);

    const webhookResponse = await makeWebhookRequest(
      'https://hedgrpay.com/api/webhooks/setu',
      'POST',
      webhookData
    );
    
    console.log(`   📥 Webhook Response:`);
    console.log(`     Status: ${webhookResponse.statusCode}`);
    console.log(`     Body: ${webhookResponse.data}\n`);

    // Wait a bit for processing
    console.log('3. Waiting for processing...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check user data
    console.log('4. Checking user data after webhook...\n');

    const userDataResponse = await makeAuthenticatedRequest(
      'https://hedgrpay.com/api/setu/user-data',
      'GET',
      null,
      token
    );
    
    console.log(`   📊 User Data Response:`);
    console.log(`     Status: ${userDataResponse.statusCode}`);
    
    if (userDataResponse.statusCode === 200) {
      const userData = JSON.parse(userDataResponse.data);
      console.log(`     Accounts: ${userData.data.accounts.length}`);
      console.log(`     Transactions: ${userData.data.transactions.length}`);
      console.log(`     Profile: ${userData.data.profile ? 'Present' : 'Null'}`);
      
      if (userData.data.accounts.length > 0) {
        console.log(`     ✅ SUCCESS! Data was stored!`);
        console.log(`     📊 First Account: ${userData.data.accounts[0].maskedAccNumber}`);
        console.log(`     💰 Balance: ${userData.data.accounts[0].summary?.currentBalance || 'N/A'}`);
      } else {
        console.log(`     ❌ No data was stored`);
      }
    } else {
      console.log(`     ❌ Failed to get user data: ${userDataResponse.data}`);
    }

    console.log('\n5. Testing with a different session ID...\n');

    // Try with a new session ID to see if it works
    const newSessionId = '72407b2b-4d01-45db-90f0-98dda57306c9';
    
    const newWebhookData = {
      type: 'SESSION_STATUS_UPDATE',
      data: {
        status: 'COMPLETED',
        sessionId: newSessionId
      },
      consentId: consentId,
      success: true,
      timestamp: new Date().toISOString()
    };

    console.log(`   📤 Sending webhook with new session ID: ${newSessionId}\n`);

    const newWebhookResponse = await makeWebhookRequest(
      'https://hedgrpay.com/api/webhooks/setu',
      'POST',
      newWebhookData
    );
    
    console.log(`   📥 New Webhook Response:`);
    console.log(`     Status: ${newWebhookResponse.statusCode}`);
    console.log(`     Body: ${newWebhookResponse.data}\n`);

    // Wait and check again
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newUserDataResponse = await makeAuthenticatedRequest(
      'https://hedgrpay.com/api/setu/user-data',
      'GET',
      null,
      token
    );
    
    console.log(`   📊 New User Data Response:`);
    console.log(`     Status: ${newUserDataResponse.statusCode}`);
    
    if (newUserDataResponse.statusCode === 200) {
      const newUserData = JSON.parse(newUserDataResponse.data);
      console.log(`     Accounts: ${newUserData.data.accounts.length}`);
      console.log(`     Transactions: ${newUserData.data.transactions.length}`);
      console.log(`     Profile: ${newUserData.data.profile ? 'Present' : 'Null'}`);
      
      if (newUserData.data.accounts.length > 0) {
        console.log(`     ✅ SUCCESS! Data was stored with new session!`);
        console.log(`     📊 First Account: ${newUserData.data.accounts[0].maskedAccNumber}`);
        console.log(`     💰 Balance: ${newUserData.data.accounts[0].summary?.currentBalance || 'N/A'}`);
      } else {
        console.log(`     ❌ Still no data stored`);
      }
    }

    console.log('\n✅ Webhook user lookup test completed!');
    console.log('\n📋 Analysis:');
    console.log('- If both webhooks return 200, webhook endpoint is working');
    console.log('- If user data shows accounts/transactions, storage is working');
    console.log('- If no data is stored, there might be an error in processing');

  } catch (error) {
    console.error('❌ Error testing webhook user lookup:', error.message);
  }
}

testWebhookUserLookupWithAuth();
