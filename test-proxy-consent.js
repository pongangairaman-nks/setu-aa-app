const https = require('https');

// Test proxy server with Setu API
async function testProxyConsent() {
  console.log('🧪 Testing Proxy Server with Setu API\n');

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
    
    // Step 2: Test proxy with Setu API
    console.log('\n📋 Step 2: Testing proxy with Setu API...');
    
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

    const proxyOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/setu-proxy/v2/consents',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`,
        'x-product-instance-id': 'e02807a8-2588-4306-83d2-5eb1e615abda'
      }
    };

    const proxyPromise = new Promise((resolve, reject) => {
      const req = require('http').request(proxyOptions, (res) => {
        console.log(`📡 Proxy Response Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('📡 Proxy Response Body:');
          try {
            const response = JSON.parse(data);
            console.log(JSON.stringify(response, null, 2));
            
            if (res.statusCode === 200 || res.statusCode === 201) {
              console.log('✅ Proxy consent creation successful!');
              console.log(`🎯 Consent URL: ${response.url}`);
            } else {
              console.log('❌ Proxy consent creation failed');
            }
            resolve(response);
          } catch (error) {
            console.log('Raw response:', data);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Proxy request failed:', error);
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    await proxyPromise;
    
    console.log('\n🎯 Proxy test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProxyConsent().then(() => {
  console.log('\n🎯 Proxy consent test finished!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
