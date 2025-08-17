const https = require('https');

// Test user authentication flow
async function testUserAuth() {
  console.log('🧪 Testing User Authentication Flow\n');

  const testUser = {
    email: 'newtest@example.com',
    password: 'password123',
    name: 'New Test User'
  };

  // Step 1: Register user
  console.log('👤 Step 1: Registering user...');
  const registerResult = await registerUser(testUser);
  
  if (registerResult.success) {
    console.log('✅ User registered successfully');
  } else {
    console.log('⚠️ User registration failed (might already exist):', registerResult.error);
  }

  // Step 2: Login user
  console.log('\n🔐 Step 2: Logging in user...');
  const loginResult = await loginUser(testUser.email, testUser.password);
  
  if (loginResult.success) {
    console.log('✅ User logged in successfully');
    console.log(`Token: ${loginResult.data.token.substring(0, 50)}...`);
    console.log(`User: ${loginResult.data.user.name} (${loginResult.data.user.email})`);
    
    // Step 3: Get current user
    console.log('\n👤 Step 3: Getting current user...');
    const userResult = await getCurrentUser(loginResult.data.token);
    
    if (userResult.success) {
      console.log('✅ Current user retrieved successfully');
      console.log(`User: ${userResult.data.name} (${userResult.data.email})`);
    } else {
      console.log('❌ Failed to get current user:', userResult.error);
    }
    
    // Step 4: Test protected endpoint
    console.log('\n🔒 Step 4: Testing protected endpoint...');
    const protectedResult = await testProtectedEndpoint(loginResult.data.token);
    
    if (protectedResult.success) {
      console.log('✅ Protected endpoint accessed successfully');
    } else {
      console.log('❌ Failed to access protected endpoint:', protectedResult.error);
    }
    
    // Step 5: Logout
    console.log('\n🚪 Step 5: Logging out...');
    const logoutResult = await logoutUser(loginResult.data.token);
    
    if (logoutResult.success) {
      console.log('✅ User logged out successfully');
    } else {
      console.log('❌ Failed to logout:', logoutResult.error);
    }
    
  } else {
    console.log('❌ Login failed:', loginResult.error);
  }
}

// Helper functions
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: response,
            error: response.error || null
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            data: responseData,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function registerUser(userData) {
  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return makeRequest(options, userData);
}

async function loginUser(email, password) {
  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return makeRequest(options, { email, password });
}

async function getCurrentUser(token) {
  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  return makeRequest(options);
}

async function testProtectedEndpoint(token) {
  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/setu/fips', // Test with a protected endpoint
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  return makeRequest(options);
}

async function logoutUser(token) {
  const options = {
    hostname: 'hedgrpay.com',
    port: 443,
    path: '/api/auth/logout',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  return makeRequest(options);
}

// Run the test
testUserAuth().then(() => {
  console.log('\n🎯 User authentication test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});
