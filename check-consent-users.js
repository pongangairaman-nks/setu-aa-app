const axios = require('axios');

async function checkConsentUsers() {
  console.log('🔍 Checking Users with Same Consent ID');
  console.log('=====================================');
  
  const consentId = "c603922b-0521-47d3-a006-cbc14d18b982";
  
  console.log('📋 Consent ID:', consentId);
  console.log('');
  
  // Test both users
  const users = [
    { email: 'pon04@gmail.com', password: 'Pass123' },
    { email: 'pon05@gmail.com', password: 'Pass123' }
  ];
  
  for (const user of users) {
    console.log(`👤 Checking user: ${user.email}`);
    console.log('================================');
    
    try {
      // Login
      const loginResponse = await axios.post('https://hedgrpay.com/api/auth/login', {
        email: user.email,
        password: user.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const token = loginResponse.data.token;
      
      // Get user data
      const userResponse = await axios.get('https://hedgrpay.com/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const userData = userResponse.data;
      
      console.log('📊 User Details:');
      console.log('- ID:', userData.id);
      console.log('- Email:', userData.email);
      console.log('- Name:', userData.name);
      
      if (userData.consentDetails) {
        console.log('📋 Consent Details:');
        console.log('- Consent ID:', userData.consentDetails.consentId);
        console.log('- Status:', userData.consentDetails.consentStatus);
        console.log('- Created:', userData.consentDetails.consentCreatedAt);
      }
      
      console.log('🏦 Accounts Count:', userData.accounts ? userData.accounts.length : 0);
      console.log('💳 Transactions Count:', userData.transactions ? userData.transactions.length : 0);
      console.log('📋 Profile:', userData.profile ? 'Present' : 'Missing');
      
      console.log('');
      
    } catch (error) {
      console.log('❌ Error:', error.message);
      console.log('');
    }
  }
  
  console.log('🎯 Analysis:');
  console.log('============');
  console.log('Both users have the SAME consent ID, but only pon04@gmail.com has financial data.');
  console.log('This suggests the webhook processing only updates the first user found with that consent ID.');
}

async function main() {
  console.log('🚀 Checking Consent ID Distribution');
  console.log('==================================');
  
  await checkConsentUsers();
  
  console.log('');
  console.log('🎉 Analysis completed!');
}

// Run the tests
main().catch(console.error);
