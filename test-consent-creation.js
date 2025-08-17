const https = require('https');

// Test the consent creation API
async function testConsentCreation() {
  console.log('🧪 Testing Consent Creation API\n');

  const consentData = {
    consentMode: 'STORE',
    fetchType: 'PERIODIC',
    consentTypes: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
    fiTypes: ['DEPOSIT'],
    vua: 'test@setu',
    purpose: {
      code: '101',
      refUri: 'https://api.rebit.org.in',
      text: 'Wealth management service'
    },
    dataLife: {
      unit: 'MONTH',
      value: 30
    },
    frequency: {
      unit: 'MONTHLY',
      value: 1
    },
    redirectUrl: 'setu-aa-app://consent-callback'
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
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': 'Bearer test-token' // This will be replaced with actual token
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📡 Response Status: ${res.statusCode}`);
      console.log(`📡 Response Headers:`, res.headers);
      
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
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
testConsentCreation().then(() => {
  console.log('\n🎯 Consent creation test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
