const https = require('https');

// Test with a simpler consent request
async function testSimpleConsent() {
  console.log('🧪 Testing Simple Consent Creation\n');

  const consentData = {
    consentMode: 'STORE',
    fetchType: 'ONETIME',
    consentTypes: ['PROFILE'],
    fiTypes: ['DEPOSIT'],
    vua: 'test@setu',
    purpose: {
      code: '101',
      refUri: 'https://api.rebit.org.in',
      text: 'Wealth management service'
    },
    dataLife: {
      unit: 'DAY',
      value: 1
    },
    redirectUrl: 'setu-aa-app://consent-callback'
  };

  console.log('📋 Simple Consent Data:');
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
            console.log('✅ Simple consent creation successful!');
            console.log(`🎯 Consent URL: ${response.url}`);
          } else {
            console.log('❌ Simple consent creation failed');
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
testSimpleConsent().then(() => {
  console.log('\n🎯 Simple consent creation test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
