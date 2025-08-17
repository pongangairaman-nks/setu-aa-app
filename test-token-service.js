const https = require('https');

// Test token service functionality
async function testTokenService() {
  console.log('🧪 Testing Token Service\n');

  // Step 1: Get token
  console.log('🔐 Step 1: Getting token...');
  
  const tokenOptions = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/auth/setu-token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const tokenPromise = new Promise((resolve, reject) => {
    const req = https.request(tokenOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.success) {
            console.log('✅ Token obtained successfully');
            console.log(`Token: ${response.data.access_token.substring(0, 50)}...`);
            console.log(`Token Type: ${response.data.token_type}`);
            console.log(`Expires In: ${response.data.expires_in} seconds`);
            resolve(response.data);
          } else {
            console.log('❌ Failed to get token:', response);
            reject(new Error('Failed to get token'));
          }
        } catch (error) {
          console.log('Raw token response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Token request failed:', error);
      reject(error);
    });

    req.end();
  });

  try {
    const tokenData = await tokenPromise;
    
    // Step 2: Test token validation logic
    console.log('\n🔍 Step 2: Testing token validation...');
    
    const now = Date.now();
    const expiresAt = now + (tokenData.expires_in * 1000) - (5 * 60 * 1000); // 5 minutes buffer
    const timeUntilExpiry = expiresAt - now;
    
    console.log(`Current time: ${new Date(now).toISOString()}`);
    console.log(`Token expires at: ${new Date(expiresAt).toISOString()}`);
    console.log(`Time until expiry: ${Math.floor(timeUntilExpiry / 60)} minutes`);
    console.log(`Token valid: ${timeUntilExpiry > 0}`);
    
    if (timeUntilExpiry > 0) {
      console.log('✅ Token is valid and ready for use');
    } else {
      console.log('❌ Token has expired');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTokenService().then(() => {
  console.log('\n🎯 Token service test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
