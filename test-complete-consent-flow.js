const https = require('https');

// Test complete consent flow with Setu FIP-2 linking
async function testCompleteConsentFlow() {
  console.log('🧪 Testing Complete Consent Flow with Setu FIP-2');
  console.log('🎯 Goal: Create consent, complete flow, and get mock bank accounts');
  console.log('');

  // Step 1: Create consent request
  console.log('📋 Step 1: Creating consent request...');
  
  const consentData = {
    consentDuration: {
      unit: 'MONTH',
      value: '24'
    },
    vua: '7530060544@onemoney', // Your mobile number
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

  const createOptions = {
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
    // Create consent
    const createResult = await new Promise((resolve, reject) => {
      const req = https.request(createOptions, (res) => {
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

    console.log(`📡 Create Consent Response Status: ${createResult.statusCode}`);
    
    if (createResult.statusCode === 200 || createResult.statusCode === 201) {
      console.log('✅ Consent created successfully!');
      console.log(`📋 Consent ID: ${createResult.data.id}`);
      console.log(`🎯 Consent URL: ${createResult.data.url}`);
      console.log(`📊 Status: ${createResult.data.status}`);
      console.log(`🏛️ VUA: ${createResult.data.detail?.vua}`);
      
      const consentId = createResult.data.id;
      const consentUrl = createResult.data.url;
      
      console.log('\n📋 Step 2: Consent Flow Instructions');
      console.log('='.repeat(60));
      console.log('🔗 Consent URL to visit:');
      console.log(consentUrl);
      console.log('');
      console.log('📱 Steps to complete consent flow:');
      console.log('1. Open the consent URL in a browser or WebView');
      console.log('2. Enter your mobile number: 7530060544');
      console.log('3. Enter OTP (if dynamic) or try static OTP: 123456');
      console.log('4. Look for "Link FIPs" or "Connect Banks" section');
      console.log('5. Select "Setu FIP-2" for mock data');
      console.log('6. Complete the consent approval');
      console.log('7. Wait for consent to become ACTIVE');
      console.log('');
      console.log('🎯 Key: You MUST link Setu FIP-2 during the flow to get mock accounts!');
      console.log('');
      
      // Step 3: Monitor consent status
      console.log('📋 Step 3: Monitoring consent status...');
      console.log('⏳ Waiting 30 seconds before checking status...');
      
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Check consent status
      const statusOptions = {
        hostname: 'hedgrpay.com',
        port: 443,
        path: `/api/setu/consents/${consentId}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      };

      const statusResult = await new Promise((resolve, reject) => {
        const req = https.request(statusOptions, (res) => {
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

      console.log(`📡 Status Check Response: ${statusResult.statusCode}`);
      
      if (statusResult.statusCode === 200) {
        const consent = statusResult.data;
        console.log(`📊 Current Status: ${consent.status}`);
        console.log(`🏛️ VUA: ${consent.detail?.vua}`);
        console.log(`📋 Accounts Linked: ${(consent.accountsLinked || []).length}`);
        
        if (consent.status === 'ACTIVE') {
          console.log('🎉 Consent is ACTIVE! Ready for data fetching.');
          
          if (consent.accountsLinked && consent.accountsLinked.length > 0) {
            console.log('🏦 Mock accounts found:');
            console.log(JSON.stringify(consent.accountsLinked, null, 2));
          } else {
            console.log('❌ No accounts linked yet. You may need to:');
            console.log('1. Complete the consent flow properly');
            console.log('2. Link Setu FIP-2 during the flow');
            console.log('3. Wait for accounts to be linked');
          }
        } else if (consent.status === 'PENDING') {
          console.log('⏳ Consent is still PENDING. Please complete the consent flow.');
          console.log('🔗 Visit:', consentUrl);
        } else {
          console.log(`⚠️  Consent status: ${consent.status}`);
        }
      } else {
        console.log('❌ Failed to check consent status:');
        console.log(JSON.stringify(statusResult.data, null, 2));
      }
      
    } else {
      console.log('❌ Consent creation failed:');
      console.log(JSON.stringify(createResult.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteConsentFlow();
