const https = require('https');

// Test CORS issue with direct Setu API call
async function testCorsIssue() {
  console.log('🧪 Testing CORS Issue with Direct Setu API\n');

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
            resolve(response.data.access_token);
          } else {
            reject(new Error('Failed to get token'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });

  try {
    const token = await tokenPromise;
    
    // Step 2: Test direct Setu API call (simulating frontend)
    console.log('\n📋 Step 2: Testing direct Setu API call (simulating frontend)...');
    
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

    const postData = JSON.stringify(consentData);

    const setuOptions = {
      hostname: 'fiu-sandbox.setu.co',
      port: 443,
      path: '/v2/consents',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`,
        'x-product-instance-id': 'e02807a8-2588-4306-83d2-5eb1e615abda',
        'Origin': 'https://hedgrpay.com', // Simulating frontend origin
        'Referer': 'https://hedgrpay.com/' // Simulating frontend referer
      }
    };

    const setuPromise = new Promise((resolve, reject) => {
      const req = https.request(setuOptions, (res) => {
        console.log(`📡 Response Status: ${res.statusCode}`);
        console.log(`📡 CORS Headers:`);
        console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`);
        console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not set'}`);
        console.log(`   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not set'}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('📡 Response Body:');
            console.log(JSON.stringify(response, null, 2));
            
            if (res.statusCode === 200 || res.statusCode === 201) {
              console.log('✅ Direct Setu API call successful!');
              console.log('🎯 This means CORS is not the issue');
            } else {
              console.log('❌ Direct Setu API call failed');
              console.log('🎯 This might indicate a CORS or other issue');
            }
            resolve(response);
          } catch (error) {
            console.log('Raw response:', data);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Setu API request failed:', error);
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    await setuPromise;
    
    console.log('\n🎯 CORS test completed!');
    console.log('If this test passes, the issue is likely in the frontend code');
    console.log('If this test fails, there might be a CORS or network issue');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCorsIssue().then(() => {
  console.log('\n🎯 CORS issue test finished!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
