const https = require('https');

// Test HTTPS endpoints for Hostinger domain
const testHostingerHTTPS = (domain) => {
  console.log(`🔒 Testing HTTPS endpoints for Hostinger domain: ${domain}\n`);
  
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

// Usage examples for Hostinger domain
console.log('🚀 HTTPS Testing Script for Hostinger Domain + EC2\n');

// Example 1: Test with subdomain (recommended)
// testHostingerHTTPS('api.yourdomain.com');

// Example 2: Test with root domain
// testHostingerHTTPS('yourdomain.com');

// Example 3: Test with custom subdomain
// testHostingerHTTPS('setu.yourdomain.com');

console.log('📝 To test your Hostinger domain setup:');
console.log('1. Replace "yourdomain.com" with your actual Hostinger domain');
console.log('2. Uncomment the appropriate testHostingerHTTPS() call above');
console.log('3. Run: node test-https-hostinger.js');
console.log('');
console.log('🔧 Setup steps:');
console.log('1. Point your Hostinger domain to EC2 (13.233.96.134)');
console.log('2. Add domain to Cloudflare');
console.log('3. Update nameservers in Hostinger');
console.log('4. Configure DNS in Cloudflare');
console.log('5. Enable SSL (Flexible mode)');
console.log('6. Test with this script');
console.log('');
console.log('📋 Example usage:');
console.log('node test-https-hostinger.js');
console.log('');
console.log('🔗 Expected URLs after setup:');
console.log('• https://api.yourdomain.com/health');
console.log('• https://api.yourdomain.com/api/consents/callback');
console.log('• https://api.yourdomain.com/api/webhooks/setu');
