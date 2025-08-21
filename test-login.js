const axios = require('axios');

async function testLogin() {
  console.log('🔐 Testing Login API');
  console.log('====================');
  console.log('📧 Email: pon04@gmail.com');
  console.log('🔑 Password: Pass123');
  console.log('');

  try {
    const response = await axios.post('https://hedgrpay.com/api/auth/login', {
      email: 'pon04@gmail.com',
      password: 'Pass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Login successful!');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    
    // Extract token for future use
    if (response.data.token) {
      console.log('🎫 Token received:', response.data.token.substring(0, 50) + '...');
      return response.data.token;
    }

  } catch (error) {
    console.log('❌ Login failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
    
    if (error.response?.status === 502) {
      console.log('🔧 502 error suggests backend issue. Let\'s check other endpoints...');
    }
  }
  
  return null;
}

async function testRegister() {
  console.log('\n📝 Testing Register API');
  console.log('=======================');
  
  try {
    const response = await axios.post('https://hedgrpay.com/api/auth/register', {
      email: 'pon04@gmail.com',
      password: 'Pass123',
      name: 'Test User'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Registration response:');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Registration failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
}

async function testSetuEndpoints() {
  console.log('\n🔍 Testing Setu Endpoints');
  console.log('=========================');
  
  // Test Setu health
  try {
    const healthResponse = await axios.get('https://hedgrpay.com/api/setu/health', {
      timeout: 10000
    });
    console.log('✅ Setu Health:', healthResponse.status, healthResponse.data);
  } catch (error) {
    console.log('❌ Setu Health failed:', error.response?.status, error.response?.data);
  }
  
  // Test Setu configuration
  try {
    const configResponse = await axios.get('https://hedgrpay.com/test-setu', {
      timeout: 10000
    });
    console.log('✅ Setu Config:', configResponse.status, configResponse.data);
  } catch (error) {
    console.log('❌ Setu Config failed:', error.response?.status, error.response?.data);
  }
}

async function main() {
  console.log('🚀 Starting API Tests');
  console.log('=====================');
  
  // Test login
  const token = await testLogin();
  
  // If login fails, try register
  if (!token) {
    await testRegister();
  }
  
  // Test Setu endpoints
  await testSetuEndpoints();
  
  console.log('\n🎉 API tests completed!');
}

// Run the tests
main().catch(console.error);
