const https = require('https');

// Test account fetching after consent approval
async function testAccountFetch() {
  console.log('🧪 Testing account fetching after consent approval');
  console.log('🎯 Goal: Check if we can fetch bank accounts from Setu sandbox');
  console.log('');

  // Test with a recent consent ID (you can replace this with your actual consent ID)
  const testConsentId = '067dfe07-2138-454a-9754-93d9e0e0023a'; // From our previous test
  
  console.log(`📋 Using consent ID: ${testConsentId}`);
  console.log('');

  const fetchData = {
    consentId: testConsentId,
    dataRange: {
      from: '2023-01-01T00:00:00Z',
      to: '2025-01-24T00:00:00Z'
    }
  };

  console.log('📋 Fetch Data:');
  console.log(JSON.stringify(fetchData, null, 2));
  console.log('');

  const postData = JSON.stringify(fetchData);

  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/accounts/fetch',
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
      console.log('✅ Account fetch successful!');
      console.log('📋 Response:');
      console.log(JSON.stringify(result.data, null, 2));
      
      if (result.data.success) {
        const accounts = result.data.data?.accounts || [];
        console.log(`\n🏦 Found ${accounts.length} bank accounts:`);
        
        if (accounts.length === 0) {
          console.log('❌ No bank accounts found!');
          console.log('\n🔍 Possible reasons:');
          console.log('1. The consent is not yet ACTIVE (still PENDING)');
          console.log('2. The mobile number is not linked to any mock bank accounts in Setu sandbox');
          console.log('3. The consent needs to be approved first');
          console.log('4. Setu sandbox doesn\'t have mock data for this mobile number');
        } else {
          accounts.forEach((account, index) => {
            console.log(`\n📋 Account ${index + 1}:`);
            console.log(`   Bank: ${account.bankName}`);
            console.log(`   Account: ${account.accountName}`);
            console.log(`   Number: ${account.accountNumber}`);
            console.log(`   Type: ${account.accountType}`);
            console.log(`   Balance: ₹${account.balance}`);
            console.log(`   Status: ${account.status}`);
          });
        }
      } else {
        console.log('❌ Account fetch failed:');
        console.log(JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log('❌ Account fetch failed:');
      console.log(JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAccountFetch();
