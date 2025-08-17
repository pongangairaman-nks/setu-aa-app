const https = require('https');

// Test sandbox token endpoint
async function testSandboxToken() {
  console.log('🧪 Testing Sandbox Token Endpoint\n');

  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/auth/setu-token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
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
          
          if (res.statusCode === 200 && response.success) {
            console.log('✅ Sandbox token obtained successfully!');
            console.log(`Token: ${response.data.access_token.substring(0, 50)}...`);
            console.log(`Token Type: ${response.data.token_type}`);
            console.log(`Expires In: ${response.data.expires_in} seconds`);
          } else {
            console.log('❌ Sandbox token request failed');
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

    req.end();
  });
}

// Run the test
testSandboxToken().then(() => {
  console.log('\n🎯 Sandbox token test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
