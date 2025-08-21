const axios = require('axios');

async function testPon05User() {
  console.log('👤 Testing User Data for pon05@gmail.com');
  console.log('========================================');
  
  try {
    // Step 1: Login to get token
    console.log('🔐 Step 1: Logging in with pon05@gmail.com...');
    const loginResponse = await axios.post('https://hedgrpay.com/api/auth/login', {
      email: 'pon05@gmail.com',
      password: 'Pass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    console.log('📄 Login Response:', JSON.stringify(loginResponse.data, null, 2));
    
    // Step 2: Get user data via auth/me
    console.log('👤 Step 2: Fetching user data via auth/me...');
    const userResponse = await axios.get('https://hedgrpay.com/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ User data response:');
    console.log('📊 Status:', userResponse.status);
    console.log('📄 User Data:', JSON.stringify(userResponse.data, null, 2));
    
    // Step 3: Analyze the data structure
    console.log('');
    console.log('🔍 Data Analysis for pon05@gmail.com:');
    console.log('=====================================');
    
    const userData = userResponse.data;
    
    if (userData.user) {
      const user = userData.user;
      
      console.log('👤 User Profile:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- Created At:', user.createdAt);
      
      // Check for profile data
      if (user.profile) {
        console.log('📋 Profile Data:');
        console.log('- Profile exists:', !!user.profile);
        console.log('- Profile details:', JSON.stringify(user.profile, null, 2));
      } else {
        console.log('❌ No profile data found');
      }
      
      // Check for accounts data
      if (user.accounts && Array.isArray(user.accounts)) {
        console.log('🏦 Accounts Data:');
        console.log('- Number of accounts:', user.accounts.length);
        if (user.accounts.length > 0) {
          console.log('- First account:', JSON.stringify(user.accounts[0], null, 2));
        }
      } else {
        console.log('❌ No accounts data found');
      }
      
      // Check for transactions data
      if (user.transactions && Array.isArray(user.transactions)) {
        console.log('💳 Transactions Data:');
        console.log('- Number of transactions:', user.transactions.length);
        if (user.transactions.length > 0) {
          console.log('- First transaction:', JSON.stringify(user.transactions[0], null, 2));
        }
      } else {
        console.log('❌ No transactions data found');
      }
      
      // Check for consent details
      if (user.consentDetails) {
        console.log('📋 Consent Details:');
        console.log('- Consent details:', JSON.stringify(user.consentDetails, null, 2));
      } else {
        console.log('❌ No consent details found');
      }
      
    } else {
      console.log('❌ No user data in response');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📄 Response:', error.response.data);
    }
  }
}

async function testRegisterPon05() {
  console.log('');
  console.log('📝 Testing Registration for pon05@gmail.com');
  console.log('===========================================');
  
  try {
    const registerResponse = await axios.post('https://hedgrpay.com/api/auth/register', {
      email: 'pon05@gmail.com',
      password: 'Pass123',
      name: 'Test User 05'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Registration response:');
    console.log('📊 Status:', registerResponse.status);
    console.log('📄 Response:', JSON.stringify(registerResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Registration failed:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('💬 Message:', error.message);
  }
}

async function main() {
  console.log('🚀 Testing pon05@gmail.com User Data');
  console.log('====================================');
  
  await testRegisterPon05();
  await testPon05User();
  
  console.log('');
  console.log('🎉 Testing completed!');
}

// Run the tests
main().catch(console.error);
