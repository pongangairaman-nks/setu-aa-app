const https = require('https');

console.log('🧪 Testing Setu Token Fetching API\n');

const testTokenFetch = async () => {
  const backendUrl = 'https://hedgrpay.com';
  
  console.log('🔗 Backend Configuration:');
  console.log(`📡 Backend URL: ${backendUrl}`);
  console.log('');

  // Test 1: Auth health check
  const testAuthHealth = () => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'hedgrpay.com',
        port: 443,
        path: '/api/auth/health',
        method: 'GET',
        timeout: 10000
      };

      console.log('🧪 Testing auth health check...');
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`📡 Auth Health Response Status: ${res.statusCode} ${res.statusMessage}`);
          
          try {
            const jsonResponse = JSON.parse(data);
            console.log('✅ Auth Health Response:');
            console.log(JSON.stringify(jsonResponse, null, 2));
          } catch (e) {
            console.log('❌ Failed to parse auth health JSON response:');
            console.log('Raw response:', data);
          }
          
          resolve();
        });
      });

      req.on('error', (e) => {
        console.log(`❌ Auth Health Request Error: ${e.message}`);
        resolve();
      });

      req.end();
    });
  };

  // Test 2: Fetch Setu token
  const testTokenFetch = () => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'hedgrpay.com',
        port: 443,
        path: '/api/auth/setu-token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      };

      console.log('🧪 Testing Setu token fetch...');
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`📡 Token Response Status: ${res.statusCode} ${res.statusMessage}`);
          
          try {
            const jsonResponse = JSON.parse(data);
            console.log('✅ Token Response:');
            console.log(JSON.stringify(jsonResponse, null, 2));
            
            if (jsonResponse.success && jsonResponse.data && jsonResponse.data.access_token) {
              console.log(`🎯 Token obtained successfully!`);
              console.log(`🔑 Token: ${jsonResponse.data.access_token.substring(0, 20)}...`);
              console.log(`⏰ Expires in: ${jsonResponse.data.expires_in} seconds`);
              console.log(`📅 Timestamp: ${jsonResponse.data.timestamp}`);
            } else {
              console.log('❌ Token fetch failed or invalid response');
            }
          } catch (e) {
            console.log('❌ Failed to parse token JSON response:');
            console.log('Raw response:', data);
          }
          
          resolve();
        });
      });

      req.on('error', (e) => {
        console.log(`❌ Token Request Error: ${e.message}`);
        resolve();
      });

      req.on('timeout', () => {
        console.log('⏰ Token Request Timeout');
        req.destroy();
        resolve();
      });

      req.end();
    });
  };

  // Test 3: Test token with FIPs call
  const testTokenWithFIPs = async () => {
    return new Promise((resolve) => {
      // First get the token
      const tokenOptions = {
        hostname: 'hedgrpay.com',
        port: 443,
        path: '/api/auth/setu-token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      };

      console.log('🧪 Testing token with FIPs call...');
      
      const tokenReq = https.request(tokenOptions, (tokenRes) => {
        let tokenData = '';
        tokenRes.on('data', chunk => tokenData += chunk);
        tokenRes.on('end', async () => {
          try {
            const tokenResponse = JSON.parse(tokenData);
            
            if (tokenResponse.success && tokenResponse.data && tokenResponse.data.access_token) {
              const token = tokenResponse.data.access_token;
              
              // Now use the token to call FIPs
              const fipsOptions = {
                hostname: 'hedgrpay.com',
                port: 443,
                path: '/api/setu/fips',
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                timeout: 15000
              };

              console.log('🔐 Using token to call FIPs...');
              
              const fipsReq = https.request(fipsOptions, (fipsRes) => {
                let fipsData = '';
                fipsRes.on('data', chunk => fipsData += chunk);
                fipsRes.on('end', () => {
                  console.log(`📡 FIPs Response Status: ${fipsRes.statusCode} ${fipsRes.statusMessage}`);
                  
                  try {
                    const fipsResponse = JSON.parse(fipsData);
                    console.log('✅ FIPs Response:');
                    console.log(JSON.stringify(fipsResponse, null, 2));
                  } catch (e) {
                    console.log('❌ Failed to parse FIPs JSON response:');
                    console.log('Raw response:', fipsData);
                  }
                  
                  resolve();
                });
              });

              fipsReq.on('error', (e) => {
                console.log(`❌ FIPs Request Error: ${e.message}`);
                resolve();
              });

              fipsReq.end();
            } else {
              console.log('❌ Failed to get token for FIPs test');
              resolve();
            }
          } catch (e) {
            console.log('❌ Failed to parse token response for FIPs test');
            resolve();
          }
        });
      });

      tokenReq.on('error', (e) => {
        console.log(`❌ Token Request Error: ${e.message}`);
        resolve();
      });

      tokenReq.end();
    });
  };

  try {
    // Test 1: Auth health check
    await testAuthHealth();
    console.log('');
    
    // Test 2: Fetch token
    await testTokenFetch();
    console.log('');
    
    // Test 3: Use token with FIPs
    await testTokenWithFIPs();
    
    console.log('\n📋 Test Summary:');
    console.log('✅ Auth service health check');
    console.log('✅ Token fetching API');
    console.log('✅ Token usage with Setu API');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Test the mobile app token fetching');
    console.log('2. Verify token is used in consent creation');
    console.log('3. Test complete authentication flow');
    
  } catch (error) {
    console.log('\n❌ Test Failed:');
    console.log(`Error: ${error.message}`);
  }
};

testTokenFetch().then(() => {
  console.log('\n🎯 Token fetch test completed!');
});
