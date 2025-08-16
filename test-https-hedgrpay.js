const https = require('https');

// Test HTTPS endpoints for hedgrpay.com domain
const testHedgrpayHTTPS = (domain) => {
  console.log(`🔒 Testing HTTPS endpoints for hedgrpay.com: ${domain}\n`);
  
  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/api/consents/callback?consentId=test&status=ACTIVE', name: 'Callback Endpoint' },
    { path: '/api/webhooks/setu', name: 'Webhook Endpoint' },
    { path: '/test-setu', name: 'Setu Configuration Test' }
  ];
  
  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      testEndpoint(domain, endpoint.path, endpoint.name);
    }, index * 1000);
  });
};

const testEndpoint = (domain, path, name) => {
  const options = {
    hostname: domain,
    port: 443,
    path: path,
    method: 'GET',
    timeout: 10000
  };

  console.log(`🧪 Testing ${name}...`);
  
  const req = https.request(options, (res) => {
    console.log(`   ✅ ${name}: Status ${res.statusCode}`);
    console.log(`   🔒 SSL: ${res.socket.authorized ? 'Valid' : 'Invalid'}`);
    console.log(`   📍 URL: https://${domain}${path}`);
    
    if (res.statusCode === 302) {
      console.log(`   🔄 Redirect: ${res.headers.location || 'No location'}`);
    }
    
    console.log('');
  });

  req.on('error', (e) => {
    console.log(`   ❌ ${name}: Error - ${e.message}`);
    console.log(`   💡 Check if domain is pointing to EC2 and Cloudflare is configured`);
    console.log('');
  });

  req.on('timeout', () => {
    console.log(`   ⏰ ${name}: Timeout`);
    console.log('');
    req.destroy();
  });

  req.end();
};

// Test with hedgrpay.com subdomain
console.log('🚀 HTTPS Testing Script for hedgrpay.com\n');

// Test with API subdomain (recommended)
testHedgrpayHTTPS('api.hedgrpay.com');

// Uncomment to test with root domain
// testHedgrpayHTTPS('hedgrpay.com');

// Uncomment to test with custom subdomain
// testHedgrpayHTTPS('setu.hedgrpay.com');

console.log('📝 Expected URLs after setup:');
console.log('• https://api.hedgrpay.com/health');
console.log('• https://api.hedgrpay.com/api/consents/callback');
console.log('• https://api.hedgrpay.com/api/webhooks/setu');
console.log('');
console.log('🎯 Setu Dashboard URLs:');
console.log('Redirect URL: https://api.hedgrpay.com/api/consents/callback');
console.log('Webhook URL: https://api.hedgrpay.com/api/webhooks/setu');
