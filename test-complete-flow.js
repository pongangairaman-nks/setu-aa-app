const http = require('http');

// Test the complete flow
const testCompleteFlow = () => {
  console.log('🧪 Testing Complete Setu Callback Flow\n');
  
  // Test 1: Success callback
  console.log('1️⃣ Testing Success Callback...');
  testCallback('test-consent-123', 'ACTIVE');
  
  // Test 2: Rejection callback
  setTimeout(() => {
    console.log('\n2️⃣ Testing Rejection Callback...');
    testCallback('test-consent-456', 'REJECTED');
  }, 2000);
  
  // Test 3: Error callback
  setTimeout(() => {
    console.log('\n3️⃣ Testing Error Callback...');
    testCallback('test-consent-789', null, 'UserCancelled', 'User cancelled the consent');
  }, 4000);
};

const testCallback = (consentId, status, error, errorMessage) => {
  let path = `/api/consents/callback?consentId=${consentId}`;
  
  if (status) {
    path += `&status=${status}`;
  }
  
  if (error) {
    path += `&error=${error}`;
  }
  
  if (errorMessage) {
    path += `&error_message=${encodeURIComponent(errorMessage)}`;
  }
  
  const options = {
    hostname: '13.233.96.134',
    port: 5000,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Location: ${res.headers.location || 'No redirect'}`);
    
    if (res.statusCode === 302) {
      console.log(`   ✅ Successfully redirecting to mobile app`);
      console.log(`   📱 Deep Link: ${res.headers.location}`);
    } else {
      console.log(`   ❌ Unexpected status code`);
    }
  });

  req.on('error', (e) => {
    console.error(`   ❌ Error: ${e.message}`);
  });

  req.end();
};

console.log('🚀 Starting Complete Flow Test...\n');
testCompleteFlow();
