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

async function testSetuEndpoints() {
  try {
    console.log('🔍 Testing Setu Session Endpoints...\n');

    // Your JWT token from the app
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE0YWZlZjU1OWVmNDM3ZDQ1OTA0YjEiLCJlbWFpbCI6InBvbjAzQGdtYWlsLmNvbSIsImlhdCI6MTc1NTcyMTA5OSwiZXhwIjoxNzU1ODA3NDk5fQ.kVXTcFoQlHRr7VGmO_hg7zOEIHwG_bHvKUbERtQjC8E';
    const sessionId = '4422328f-5ee4-439a-89df-cbfb6795295c';

    console.log('1. Testing session status endpoint (what setuService uses)...');
    console.log(`   Endpoint: /api/setu/sessions/${sessionId}\n`);

    const sessionStatusResponse = await makeAuthenticatedRequest(
      `https://hedgrpay.com/api/setu/sessions/${sessionId}`,
      'GET',
      null,
      token
    );
    
    console.log(`   Status: ${sessionStatusResponse.statusCode}`);
    console.log(`   Response: ${sessionStatusResponse.data}\n`);

    console.log('2. Testing session data endpoint (what our routes use)...');
    console.log(`   Endpoint: /api/setu/sessions/${sessionId}/data\n`);

    const sessionDataResponse = await makeAuthenticatedRequest(
      `https://hedgrpay.com/api/setu/sessions/${sessionId}/data`,
      'GET',
      null,
      token
    );
    
    console.log(`   Status: ${sessionDataResponse.statusCode}`);
    console.log(`   Response: ${sessionDataResponse.data}\n`);

    // 3. Let's also test creating a new session and immediately checking its status
    console.log('3. Creating a new session and checking status...');
    
    const newSessionData = {
      consentId: '0927eee7-2b83-47cd-8bd2-791efb417ecf',
      dataRange: {
        from: "2025-06-10T00:00:00.000Z",
        to: "2025-06-20T00:00:00.000Z"
      },
      format: "json"
    };

    const createSessionResponse = await makeAuthenticatedRequest(
      'https://hedgrpay.com/api/setu/sessions',
      'POST',
      newSessionData,
      token
    );
    
    console.log(`   Create Status: ${createSessionResponse.statusCode}`);
    const createResult = JSON.parse(createSessionResponse.data);
    console.log(`   New Session ID: ${createResult.id}`);
    console.log(`   New Session Status: ${createResult.status}\n`);

    // Wait a bit and check the new session
    console.log('4. Waiting 5 seconds and checking new session status...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const newSessionStatusResponse = await makeAuthenticatedRequest(
      `https://hedgrpay.com/api/setu/sessions/${createResult.id}`,
      'GET',
      null,
      token
    );
    
    console.log(`   Status: ${newSessionStatusResponse.statusCode}`);
    console.log(`   Response: ${newSessionStatusResponse.data}\n`);

    console.log('✅ Setu endpoints test completed!');
    console.log('\n📋 Analysis:');
    console.log('- If session status endpoint works, setuService should work');
    console.log('- If session data endpoint works, our routes should work');
    console.log('- If both fail, Setu might not be sending data for these sessions');

  } catch (error) {
    console.error('❌ Error testing Setu endpoints:', error.message);
  }
}

testSetuEndpoints();
