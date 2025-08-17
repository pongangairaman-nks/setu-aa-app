const https = require('https');

// Get fresh token and create consent
async function testConsentWithFreshToken() {
  console.log('🧪 Testing Consent Creation with Fresh Sandbox Token\n');

  // Step 1: Get fresh token
  console.log('🔐 Step 1: Getting fresh sandbox token...');
  
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
            console.log('✅ Fresh token obtained successfully');
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
    
    // Step 2: Create consent with fresh token
    console.log('\n📋 Step 2: Creating consent with fresh token...');
    
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

    const consentOptions = {
      hostname: 'hedgrpay.com',
      port: 443,
      path: '/api/setu/consents',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`
      }
    };

    const consentPromise = new Promise((resolve, reject) => {
      const req = https.request(consentOptions, (res) => {
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
              console.log('✅ Consent creation successful!');
              console.log(`🎯 Consent URL: ${response.url}`);
            } else {
              console.log('❌ Consent creation failed');
            }
          } catch (error) {
            console.log('Raw response:', data);
            console.log('❌ Failed to parse JSON response');
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        console.error('❌ Consent request failed:', error);
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    await consentPromise;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testConsentWithFreshToken().then(() => {
  console.log('\n🎯 Consent creation test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
