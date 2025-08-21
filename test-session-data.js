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

async function testSessionData() {
  try {
    console.log('🔍 Testing Session Data Endpoint...\n');

    // Your JWT token from the app
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE0YWZlZjU1OWVmNDM3ZDQ1OTA0YjEiLCJlbWFpbCI6InBvbjAzQGdtYWlsLmNvbSIsImlhdCI6MTc1NTcyMTA5OSwiZXhwIjoxNzU1ODA3NDk5fQ.kVXTcFoQlHRr7VGmO_hg7zOEIHwG_bHvKUbERtQjC8E';
    const sessionId = '4422328f-5ee4-439a-89df-cbfb6795295c';

    console.log('1. Testing session data endpoint...');
    console.log(`   Session ID: ${sessionId}\n`);

    const sessionDataResponse = await makeAuthenticatedRequest(
      `https://hedgrpay.com/api/setu/sessions/${sessionId}/data`,
      'GET',
      null,
      token
    );
    
    console.log(`   Status: ${sessionDataResponse.statusCode}`);
    console.log(`   Response: ${sessionDataResponse.data}\n`);

    if (sessionDataResponse.statusCode === 200) {
      const data = JSON.parse(sessionDataResponse.data);
      console.log('✅ Successfully fetched session data!');
      console.log(`   Status: ${data.status || 'Unknown'}`);
      console.log(`   FIPs: ${data.fips ? data.fips.length : 0}`);
      
      if (data.fips && data.fips.length > 0) {
        console.log('   📊 Data Summary:');
        data.fips.forEach((fip, index) => {
          console.log(`     FIP ${index + 1}: ${fip.accounts ? fip.accounts.length : 0} accounts`);
          if (fip.accounts && fip.accounts.length > 0) {
            fip.accounts.forEach((account, accIndex) => {
              console.log(`       Account ${accIndex + 1}: ${account.maskedAccNumber} (${account.accType})`);
              if (account.data && account.data.transactions) {
                console.log(`         Transactions: ${account.data.transactions.transaction ? account.data.transactions.transaction.length : 0}`);
              }
            });
          }
        });
      }
    } else {
      console.log('❌ Failed to fetch session data');
      console.log(`   Error: ${sessionDataResponse.data}`);
    }

  } catch (error) {
    console.error('❌ Error testing session data:', error.message);
  }
}

testSessionData();
