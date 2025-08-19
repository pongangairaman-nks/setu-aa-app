const https = require('https');

// Test different mobile numbers that might have mock bank accounts
async function testDifferentMobileNumbers() {
  console.log('🧪 Testing different mobile numbers for mock bank accounts');
  console.log('🎯 Goal: Find a mobile number that has mock bank accounts in Setu sandbox');
  console.log('');

  const testMobileNumbers = [
    '9999999999', // Current test number
    '8888888888', // Alternative test number
    '7777777777', // Another test number
    '6666666666', // Another test number
    '5555555555', // Another test number
    '9876543210', // Common test number
    '1234567890', // Another common test number
    '9876543211', // Another test number
    '9876543212', // Another test number
    '9876543213'  // Another test number
  ];

  for (const mobileNumber of testMobileNumbers) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing mobile number: ${mobileNumber}`);
    console.log(`${'='.repeat(60)}`);

    const consentData = {
      consentDuration: {
        unit: 'MONTH',
        value: '24'
      },
      vua: mobileNumber,
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

    const options = {
      hostname: 'hedgrpay.com',
      port: 443,
      path: '/api/setu/consents',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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

        req.write(postData);
        req.end();
      });

      console.log(`📡 Response Status: ${result.statusCode}`);
      
      if (result.statusCode === 200 || result.statusCode === 201) {
        console.log('✅ Consent created successfully!');
        console.log(`📋 Consent ID: ${result.data.id}`);
        console.log(`🎯 Consent URL: ${result.data.url}`);
        console.log(`📊 Status: ${result.data.status}`);
        console.log(`🏛️ VUA: ${result.data.detail?.vua}`);
        console.log(`📋 FI Types: ${JSON.stringify(result.data.detail?.fiTypes)}`);
        
        // Check if accounts are linked
        const accountsLinked = result.data.accountsLinked || [];
        console.log(`📋 Accounts Linked: ${accountsLinked.length}`);
        
        if (accountsLinked.length > 0) {
          console.log('🎉 FOUND MOBILE NUMBER WITH MOCK ACCOUNTS!');
          console.log('📱 This mobile number has mock bank accounts linked');
          console.log('🔗 Approve consent at:', result.data.url);
          console.log('📋 Mock accounts:', JSON.stringify(accountsLinked, null, 2));
        } else {
          console.log('❌ No mock accounts linked to this mobile number');
        }
        
        console.log('\n🔗 Test this URL to see which FIP/AA it routes to:');
        console.log(result.data.url);
      } else {
        console.log('❌ Consent creation failed:');
        console.log(JSON.stringify(result.data, null, 2));
      }
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the tests
testDifferentMobileNumbers();
