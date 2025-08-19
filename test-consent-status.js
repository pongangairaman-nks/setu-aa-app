const https = require('https');

// Test consent status to see if it's ACTIVE
async function testConsentStatus() {
  console.log('🧪 Testing consent status to see if it\'s ACTIVE');
  console.log('🎯 Goal: Check if consent is approved and ready for data fetching');
  console.log('');

  // Test with a recent consent ID
  const testConsentId = '067dfe07-2138-454a-9754-93d9e0e0023a'; // From our previous test
  
  console.log(`📋 Using consent ID: ${testConsentId}`);
  console.log('');

  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: `/api/setu/consents/${testConsentId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000
  };

  try {
    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonResponse = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: jsonResponse });
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });

    console.log(`📡 Response Status: ${result.statusCode}`);
    
    if (result.statusCode === 200) {
      console.log('✅ Consent status fetched successfully!');
      console.log('📋 Response:');
      console.log(JSON.stringify(result.data, null, 2));
      
      if (result.data.success) {
        const consent = result.data.data;
        console.log(`\n📊 Consent Status: ${consent.status}`);
        console.log(`🏛️ VUA: ${consent.vua || 'N/A'}`);
        console.log(`📅 Created: ${consent.createdAt}`);
        console.log(`📅 Expires: ${consent.expiresAt}`);
        
        if (consent.status === 'ACTIVE') {
          console.log('✅ Consent is ACTIVE - ready for data fetching!');
        } else if (consent.status === 'PENDING') {
          console.log('⏳ Consent is PENDING - needs to be approved first');
          console.log('🔗 Approve consent at:', consent.consentUrl);
        } else {
          console.log(`⚠️  Consent status is ${consent.status} - may not be ready for data fetching`);
        }
      } else {
        console.log('❌ Failed to get consent status:');
        console.log(JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log('❌ Failed to get consent status:');
      console.log(JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testConsentStatus();
