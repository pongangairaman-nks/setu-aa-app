const https = require('https');

// Test the FIPs endpoint to see if token works for other operations
async function testFIPsEndpoint() {
  console.log('🧪 Testing FIPs Endpoint\n');

  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/setu/fips',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
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
          
          if (res.statusCode === 200) {
            console.log('✅ FIPs endpoint works!');
            if (response.fips && response.fips.length > 0) {
              console.log(`🎯 Found ${response.fips.length} FIPs`);
              response.fips.forEach((fip, index) => {
                console.log(`  ${index + 1}. ${fip.name} (${fip.id})`);
              });
            }
          } else {
            console.log('❌ FIPs endpoint failed');
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

    req.end();
  });
}

// Run the test
testFIPsEndpoint().then(() => {
  console.log('\n🎯 FIPs endpoint test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
