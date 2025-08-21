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

async function testUserConsent() {
  try {
    console.log('🔍 Testing User Consent Details...\n');

    // Your JWT token from the app
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE0YWZlZjU1OWVmNDM3ZDQ1OTA0YjEiLCJlbWFpbCI6InBvbjAzQGdtYWlsLmNvbSIsImlhdCI6MTc1NTcyMTA5OSwiZXhwIjoxNzU1ODA3NDk5fQ.kVXTcFoQlHRr7VGmO_hg7zOEIHwG_bHvKUbERtQjC8E';
    const consentId = '0927eee7-2b83-47cd-8bd2-791efb417ecf';

    console.log('1. Checking user profile...');
    const userResponse = await makeAuthenticatedRequest(
      'https://hedgrpay.com/api/auth/me',
      'GET',
      null,
      token
    );
    
    console.log(`   Status: ${userResponse.statusCode}`);
    const userData = JSON.parse(userResponse.data);
    console.log(`   User ID: ${userData.id}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Consent ID: ${userData.consentDetails?.consentId}`);
    console.log(`   Consent Status: ${userData.consentDetails?.consentStatus}`);
    console.log(`   Expected Consent ID: ${consentId}`);
    console.log(`   Match: ${userData.consentDetails?.consentId === consentId ? '✅ YES' : '❌ NO'}\n`);

    console.log('2. Checking user data...');
    const userDataResponse = await makeAuthenticatedRequest(
      'https://hedgrpay.com/api/setu/user-data',
      'GET',
      null,
      token
    );
    
    console.log(`   Status: ${userDataResponse.statusCode}`);
    const data = JSON.parse(userDataResponse.data);
    console.log(`   Accounts: ${data.data.accounts.length}`);
    console.log(`   Transactions: ${data.data.transactions.length}`);
    console.log(`   Profile: ${data.data.profile ? 'Present' : 'Null'}\n`);

    console.log('✅ User consent test completed!');
    console.log('\n📋 Analysis:');
    if (userData.consentDetails?.consentId === consentId) {
      console.log('- ✅ User has the correct consent ID');
      console.log('- ❌ But webhook is not storing data');
      console.log('- 🔍 Need to check webhook logs');
    } else {
      console.log('- ❌ User does not have the correct consent ID');
      console.log('- 🔍 This is why webhook cannot find the user');
    }

  } catch (error) {
    console.error('❌ Error testing user consent:', error.message);
  }
}

testUserConsent();
