const https = require('https');

// Test backend consent endpoint
async function testBackendConsent() {
  console.log('🧪 Testing Backend Consent Endpoint\n');

  const consentData = {
    consentDuration: {
      unit: 'MONTH',
      value: '24'
    },
    vua: '9999999999@onemoney',
    dataRange: {
      from: '2023-01-01T00:00:00Z',
      to: '2025-01-24T00:00:00Z'
    },
    consentTypes: [
      'PROFILE',
      'SUMMARY',
      'TRANSACTIONS'
    ],
    context: []
  };

  console.log('📋 Consent Data:');
  console.log(JSON.stringify(consentData, null, 2));
  console.log('');

  const postData = JSON.stringify(consentData);

  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/setu/consents',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📡 Response Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 Response Body:');
        try {
          const response = JSON.parse(data);
          console.log(JSON.stringify(response, null, 2));
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Backend consent creation successful!');
            console.log(`🎯 Consent URL: ${response.url}`);
          } else {
            console.log('❌ Backend consent creation failed');
          }
        } catch (error) {
          console.log('Raw response:', data);
          console.log('❌ Failed to parse JSON response');
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
testBackendConsent().then(() => {
  console.log('\n🎯 Backend consent test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
