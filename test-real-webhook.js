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

async function testRealWebhook() {
  try {
    console.log('🔍 Testing Real Webhook Flow...\n');

    // Your JWT token from the app
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE0YWZlZjU1OWVmNDM3ZDQ1OTA0YjEiLCJlbWFpbCI6InBvbjAzQGdtYWlsLmNvbSIsImlhdCI6MTc1NTcyMTA5OSwiZXhwIjoxNzU1ODA3NDk5fQ.kVXTcFoQlHRr7VGmO_hg7zOEIHwG_bHvKUbERtQjC8E';
    const sessionId = '8043b2e7-c2c8-485b-b405-891ce10af111';
    const consentId = '0927eee7-2b83-47cd-8bd2-791efb417ecf';

    // 1. Check current user data
    console.log('1. Checking current user data...');
    const currentData = await makeAuthenticatedRequest('https://hedgrpay.com/api/setu/user-data', 'GET', null, token);
    console.log(`   Status: ${currentData.statusCode}`);
    const userData = JSON.parse(currentData.data);
    console.log(`   Accounts: ${userData.data.accounts.length}`);
    console.log(`   Transactions: ${userData.data.transactions.length}\n`);

    // 2. Create a new data session to trigger webhook
    console.log('2. Creating a new data session...');
    const newSessionData = {
      consentId: consentId,
      dataRange: {
        from: "2025-06-10T00:00:00.000Z",
        to: "2025-06-20T00:00:00.000Z"
      },
      format: "json"
    };

    const sessionResponse = await makeAuthenticatedRequest(
      'https://hedgrpay.com/api/setu/sessions', 
      'POST', 
      newSessionData, 
      token
    );
    
    console.log(`   Status: ${sessionResponse.statusCode}`);
    const sessionResult = JSON.parse(sessionResponse.data);
    console.log(`   Session ID: ${sessionResult.id}`);
    console.log(`   Status: ${sessionResult.status}\n`);

    // 3. Wait a bit and check if webhook was received
    console.log('3. Waiting 10 seconds for potential webhook...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 4. Check user data again
    console.log('4. Checking user data after waiting...');
    const updatedData = await makeAuthenticatedRequest('https://hedgrpay.com/api/setu/user-data', 'GET', null, token);
    console.log(`   Status: ${updatedData.statusCode}`);
    const updatedUserData = JSON.parse(updatedData.data);
    console.log(`   Accounts: ${updatedUserData.data.accounts.length}`);
    console.log(`   Transactions: ${updatedUserData.data.transactions.length}\n`);

    // 5. Manually trigger webhook for the new session
    console.log('5. Manually triggering webhook for the new session...');
    const webhookData = {
      type: 'SESSION_STATUS_UPDATE',
      data: {
        status: 'COMPLETED',
        sessionId: sessionResult.id
      },
      consentId: consentId,
      success: true,
      timestamp: new Date().toISOString()
    };

    const webhookResponse = await makeAuthenticatedRequest(
      'https://hedgrpay.com/api/webhooks/setu',
      'POST',
      webhookData
    );
    
    console.log(`   Status: ${webhookResponse.statusCode}`);
    console.log(`   Response: ${webhookResponse.data}\n`);

    // 6. Check user data after manual webhook
    console.log('6. Checking user data after manual webhook...');
    const finalData = await makeAuthenticatedRequest('https://hedgrpay.com/api/setu/user-data', 'GET', null, token);
    console.log(`   Status: ${finalData.statusCode}`);
    const finalUserData = JSON.parse(finalData.data);
    console.log(`   Accounts: ${finalUserData.data.accounts.length}`);
    console.log(`   Transactions: ${finalUserData.data.transactions.length}\n`);

    console.log('✅ Real webhook test completed!');
    console.log('\n📋 Analysis:');
    console.log('- If accounts/transactions increased after step 6, webhook processing works');
    console.log('- If no change, Setu might not be sending webhooks automatically');
    console.log('- Manual webhook trigger should populate data if Setu API works');

  } catch (error) {
    console.error('❌ Error testing real webhook:', error.message);
  }
}

testRealWebhook();
