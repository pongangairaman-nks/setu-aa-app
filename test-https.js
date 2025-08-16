const https = require('https');

// Test HTTPS endpoints
const testHTTPS = (domain) => {
  console.log(`🔒 Testing HTTPS endpoints for: ${domain}\n`);
  
  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/api/consents/callback?consentId=test&status=ACTIVE', name: 'Callback Endpoint' },
    { path: '/api/webhooks/setu', name: 'Webhook Endpoint' }
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
    console.log(`   💡 Make sure the domain is set up correctly`);
    console.log('');
  });

  req.on('timeout', () => {
    console.log(`   ⏰ ${name}: Timeout`);
    console.log('');
    req.destroy();
  });

  req.end();
};

// Usage examples
console.log('🚀 HTTPS Testing Script for Setu AA Backend\n');

// Example 1: Test with nip.io domain (if Let's Encrypt is set up)
// testHTTPS('13.233.96.134.nip.io');

// Example 2: Test with your custom domain (replace with your domain)
// testHTTPS('yourdomain.com');

// Example 3: Test with subdomain
// testHTTPS('api.yourdomain.com');

console.log('📝 To test your HTTPS setup:');
console.log('1. Uncomment one of the testHTTPS() calls above');
console.log('2. Replace "yourdomain.com" with your actual domain');
console.log('3. Run: node test-https.js');
console.log('');
console.log('🔧 Setup options:');
console.log('• Cloudflare (easiest): https://cloudflare.com');
console.log('• Let\'s Encrypt: Run ./setup-ssl.sh');
console.log('• AWS Certificate Manager: Use AWS console');
console.log('');
console.log('📋 Example usage:');
console.log('node test-https.js');
