const https = require('https');

// Function to make HTTPS request
function makeRequest(url, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testSetuDataFetch() {
  try {
    console.log('🔍 Testing Setu Data Fetch...\n');

    // Test with the session ID from our test
    const sessionId = '4422328f-5ee4-439a-89df-cbfb6795295c';
    
    console.log('1. Testing direct Setu API call...');
    console.log(`   Session ID: ${sessionId}`);
    console.log('   Note: This requires valid Setu token and product ID\n');

    // We need to get a fresh Setu token first
    console.log('2. Getting fresh Setu token...');
    const tokenResponse = await makeRequest('https://hedgrpay.com/api/setu/token', 'GET');
    console.log(`   Status: ${tokenResponse.statusCode}`);
    
    if (tokenResponse.statusCode === 200) {
      const tokenData = JSON.parse(tokenResponse.data);
      console.log(`   Token received: ${tokenData.token ? 'Yes' : 'No'}\n`);

      // Now try to fetch data from Setu
      console.log('3. Fetching data from Setu...');
      const setuHeaders = {
        'Authorization': `Bearer ${tokenData.token}`,
        'x-product-instance-id': 'b6d7a54a-6150-4fe7-a556-d37763720bcd'
      };

      const setuResponse = await makeRequest(
        `https://fiu-uat.setu.co/v2/sessions/${sessionId}`,
        'GET',
        setuHeaders
      );
      
      console.log(`   Status: ${setuResponse.statusCode}`);
      console.log(`   Response: ${setuResponse.data}\n`);

      if (setuResponse.statusCode === 200) {
        const setuData = JSON.parse(setuResponse.data);
        console.log('✅ Successfully fetched data from Setu!');
        console.log(`   Session Status: ${setuData.status}`);
        console.log(`   FIPs: ${setuData.fips ? setuData.fips.length : 0}`);
        
        if (setuData.fips && setuData.fips.length > 0) {
          console.log('   📊 Data Summary:');
          setuData.fips.forEach((fip, index) => {
            console.log(`     FIP ${index + 1}: ${fip.accounts ? fip.accounts.length : 0} accounts`);
          });
        }
      } else {
        console.log('❌ Failed to fetch data from Setu');
        console.log(`   Error: ${setuResponse.data}`);
      }
    } else {
      console.log('❌ Failed to get Setu token');
      console.log(`   Error: ${tokenResponse.data}`);
    }

  } catch (error) {
    console.error('❌ Error testing Setu data fetch:', error.message);
  }
}

testSetuDataFetch();
