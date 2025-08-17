const https = require('https');

// Test direct Setu API call
async function testDirectSetuAPI() {
  console.log('🧪 Testing Direct Setu API Call\n');

  // Step 1: Get token from our backend
  console.log('🔐 Step 1: Getting token from backend...');
  
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
            resolve(response.data.access_token);
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
    const token = await tokenPromise;
    
    // Step 2: Make direct call to Setu API
    console.log('\n📋 Step 2: Making direct call to Setu API...');
    
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

    const setuOptions = {
      hostname: 'fiu-sandbox.setu.co',
      port: 443,
      path: '/v2/consents',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`,
        'x-product-instance-id': 'e02807a8-2588-4306-83d2-5eb1e615abda'
      }
    };

    const setuPromise = new Promise((resolve, reject) => {
      const req = https.request(setuOptions, (res) => {
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
              console.log('✅ Direct Setu API call successful!');
              console.log(`🎯 Consent URL: ${response.url}`);
            } else {
              console.log('❌ Direct Setu API call failed');
            }
          } catch (error) {
            console.log('Raw response:', data);
            console.log('❌ Failed to parse JSON response');
          }
          resolve();
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
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDirectSetuAPI().then(() => {
  console.log('\n🎯 Direct Setu API test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
