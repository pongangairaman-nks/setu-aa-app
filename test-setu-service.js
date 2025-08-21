const https = require('https');

// Function to make HTTPS request
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

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

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function testSetuService() {
  try {
    console.log('🔍 Testing Setu Service Directly...\n');

    const sessionId = '4422328f-5ee4-439a-89df-cbfb6795295c';

    console.log('1. Testing setuService.fetchFinancialDataBySessionId via backend...');
    console.log(`   Session ID: ${sessionId}\n`);

    // Test the backend endpoint that uses setuService
    const backendResponse = await makeRequest(
      `https://hedgrpay.com/api/setu/sessions/${sessionId}/data`
    );
    
    console.log(`   Backend Status: ${backendResponse.statusCode}`);
    if (backendResponse.statusCode === 200) {
      const data = JSON.parse(backendResponse.data);
      console.log(`   ✅ Backend Success!`);
      console.log(`   Status: ${data.status}`);
      console.log(`   FIPs: ${data.fips ? data.fips.length : 0}`);
      
      if (data.fips && data.fips.length > 0) {
        console.log(`   📊 Data Summary:`);
        data.fips.forEach((fip, index) => {
          console.log(`     FIP ${index + 1}: ${fip.accounts ? fip.accounts.length : 0} accounts`);
          if (fip.accounts && fip.accounts.length > 0) {
            fip.accounts.forEach((account, accIndex) => {
              console.log(`       Account ${accIndex + 1}: ${account.maskedAccNumber}`);
              if (account.data && account.data.transactions) {
                console.log(`         Transactions: ${account.data.transactions.transaction ? account.data.transactions.transaction.length : 0}`);
              }
            });
          }
        });
      }
    } else {
      console.log(`   ❌ Backend Failed: ${backendResponse.data}`);
    }

    console.log('\n2. Testing webhook processing...');
    console.log('   Manually triggering webhook with COMPLETED status...\n');

    const webhookData = {
      type: 'SESSION_STATUS_UPDATE',
      data: {
        status: 'COMPLETED',
        sessionId: sessionId
      },
      consentId: '0927eee7-2b83-47cd-8bd2-791efb417ecf',
      success: true,
      timestamp: new Date().toISOString()
    };

    const webhookResponse = await makeRequest(
      'https://hedgrpay.com/api/webhooks/setu',
      'POST',
      {},
      JSON.stringify(webhookData)
    );
    
    console.log(`   Webhook Status: ${webhookResponse.statusCode}`);
    console.log(`   Webhook Response: ${webhookResponse.data}\n`);

    console.log('3. Checking if data was stored...');
    
    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const userDataResponse = await makeRequest(
      'https://hedgrpay.com/api/setu/user-data'
    );
    
    console.log(`   User Data Status: ${userDataResponse.statusCode}`);
    if (userDataResponse.statusCode === 200) {
      const userData = JSON.parse(userDataResponse.data);
      console.log(`   Accounts: ${userData.data.accounts.length}`);
      console.log(`   Transactions: ${userData.data.transactions.length}`);
      console.log(`   Profile: ${userData.data.profile ? 'Present' : 'Null'}`);
    } else {
      console.log(`   ❌ Failed to get user data: ${userDataResponse.data}`);
    }

    console.log('\n✅ Setu service test completed!');
    console.log('\n📋 Analysis:');
    console.log('- If backend returns 200, setuService is working');
    console.log('- If webhook returns 200, webhook processing is working');
    console.log('- If user data shows accounts/transactions, storage is working');

  } catch (error) {
    console.error('❌ Error testing setu service:', error.message);
  }
}

testSetuService();
