const https = require('https');

// Test the registration API directly
async function testRegistration() {
  console.log('🧪 Testing Registration API...\n');

  const testUser = {
    email: 'button-test@example.com',
    password: 'password123',
    name: 'Button Test User'
  };

  try {
    console.log('📝 Step 1: Testing registration API...');
    
    const options = {
      hostname: 'hedgrpay.com',
      port: 443,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({
              success: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              data: result
            });
          } catch (error) {
            resolve({
              success: false,
              status: res.statusCode,
              data: data
            });
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify(testUser));
      req.end();
    });

    if (response.success) {
      console.log('✅ Registration API working correctly');
      console.log('📋 Response:', response.data);
      
      // Test login with the same credentials
      console.log('\n🔐 Step 2: Testing login with registered user...');
      
      const loginOptions = {
        hostname: 'hedgrpay.com',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const loginResponse = await new Promise((resolve, reject) => {
        const req = https.request(loginOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve({
                success: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                data: result
              });
            } catch (error) {
              resolve({
                success: false,
                status: res.statusCode,
                data: data
              });
            }
          });
        });

        req.on('error', reject);
        req.write(JSON.stringify({
          email: testUser.email,
          password: testUser.password
        }));
        req.end();
      });

      if (loginResponse.success) {
        console.log('✅ Login API working correctly');
        console.log('🔑 Token received:', loginResponse.data.token ? 'Yes' : 'No');
      } else {
        console.log('❌ Login failed:', loginResponse.data);
      }
      
    } else {
      console.log('❌ Registration failed:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRegistration().then(() => {
  console.log('\n🎯 Registration API test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
