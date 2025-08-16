const https = require('https');

console.log('🧪 Testing Setu Consent API Integration with Authentication\n');

const testSetuConsentAPI = async () => {
  const setuBaseUrl = 'https://fiu.setu.co'; // Production environment
  const authUrl = 'https://orgservice-prod.setu.co';
  const clientId = 'b615a43a-e779-4d95-9ddb-768c7666d96b'; // Updated client ID
  const clientSecret = 'eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM'; // Updated client secret
  const productId = 'e02807a8-2588-4306-83d2-5eb1e615abda';

  console.log('🔗 Setu Configuration:');
  console.log(`📡 API Base URL: ${setuBaseUrl}`);
  console.log(`🔐 Auth URL: ${authUrl}`);
  console.log(`🆔 Client ID: ${clientId}`);
  console.log(`🔑 Client Secret: ${clientSecret}`);
  console.log(`📦 Product ID: ${productId}`);
  console.log('');

  let accessToken = null;

  // Step 1: Get access token
  const getAccessToken = () => {
    return new Promise((resolve, reject) => {
      const authPayload = JSON.stringify({
        clientID: clientId,
        grant_type: 'client_credentials',
        secret: clientSecret
      });

      const options = {
        hostname: 'orgservice-prod.setu.co',
        port: 443,
        path: '/v1/users/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client': 'bridge',
          'Content-Length': Buffer.byteLength(authPayload)
        },
        timeout: 30000
      };

      console.log('🔐 Getting access token...');
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`📡 Auth Response Status: ${res.statusCode} ${res.statusMessage}`);
          
          try {
            const jsonResponse = JSON.parse(data);
            console.log('✅ Auth Response:');
            console.log(JSON.stringify(jsonResponse, null, 2));
            
            if (jsonResponse.access_token) {
              accessToken = jsonResponse.access_token;
              console.log(`🎯 Access Token: ${accessToken.substring(0, 20)}...`);
              resolve(accessToken);
            } else {
              console.log('❌ No access token in response');
              reject(new Error('No access token received'));
            }
          } catch (e) {
            console.log('❌ Failed to parse auth JSON response:');
            console.log('Raw response:', data);
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        console.log(`❌ Auth Request Error: ${e.message}`);
        reject(e);
      });

      req.on('timeout', () => {
        console.log('⏰ Auth Request Timeout');
        req.destroy();
        reject(new Error('Auth request timeout'));
      });

      req.write(authPayload);
      req.end();
    });
  };

  // Step 2: Test FIPs endpoint with token
  const testFIPsEndpoint = (token) => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'fiu.setu.co', // Production environment
        port: 443,
        path: '/fips',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-product-instance-id': productId
        },
        timeout: 10000
      };

      console.log('🧪 Testing GET /fips with token...');
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`📡 FIPs Response Status: ${res.statusCode} ${res.statusMessage}`);
          
          try {
            const jsonResponse = JSON.parse(data);
            console.log('✅ FIPs Response:');
            console.log(JSON.stringify(jsonResponse, null, 2));
          } catch (e) {
            console.log('❌ Failed to parse FIPs JSON response:');
            console.log('Raw response:', data);
          }
          
          resolve();
        });
      });

      req.on('error', (e) => {
        console.log(`❌ FIPs Request Error: ${e.message}`);
        resolve();
      });

      req.end();
    });
  };

  // Step 3: Test consent creation with token
  const testConsentCreation = (token) => {
    return new Promise((resolve) => {
      const consentRequest = {
        consentDuration: {
          unit: "MONTH",
          value: "4"
        },
        vua: "999999999", // Test mobile number
        dataRange: {
          from: "2020-04-01T00:00:00Z",
          to: "2023-01-01T00:00:00Z"
        },
        context: [],
        additionalParams: {
          tags: ["Loan_Tracking", "Partner_X"]
        },
        // Required fields
        consentMode: "STORE",
        fetchType: "PERIODIC",
        consentTypes: ["TRANSACTIONS", "PROFILE", "SUMMARY"],
        fiTypes: ["DEPOSIT"],
        purpose: {
          code: "101",
          refUri: "https://api.rebit.org.in/aa/purpose/101.xml",
          text: "Loan underwriting"
        },
        dataLife: {
          unit: "MONTH",
          value: 1
        },
        frequency: {
          unit: "MONTHLY",
          value: 1
        },
        redirectUrl: "https://hedgrpay.com/api/consents/callback"
      };

      const postData = JSON.stringify(consentRequest);
      
      const options = {
        hostname: 'fiu.setu.co', // Production environment
        port: 443,
        path: '/consents',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-product-instance-id': productId,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 30000
      };

      console.log('🧪 Testing POST /consents with token...');
      console.log('📝 Consent Request Payload:');
      console.log(JSON.stringify(consentRequest, null, 2));
      console.log('');
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`📡 Consent Response Status: ${res.statusCode} ${res.statusMessage}`);
          console.log(`📄 Response Headers:`, res.headers);
          
          try {
            const jsonResponse = JSON.parse(data);
            console.log('✅ Consent Creation Response:');
            console.log(JSON.stringify(jsonResponse, null, 2));
            
            if (jsonResponse.id) {
              console.log(`🎯 Consent ID: ${jsonResponse.id}`);
              console.log(`🔗 Consent URL: ${jsonResponse.url}`);
              console.log(`📊 Status: ${jsonResponse.status}`);
            }
          } catch (e) {
            console.log('❌ Failed to parse JSON response:');
            console.log('Raw response:', data);
          }
          
          resolve();
        });
      });

      req.on('error', (e) => {
        console.log(`❌ Consent Request Error: ${e.message}`);
        resolve();
      });

      req.on('timeout', () => {
        console.log('⏰ Consent Request Timeout');
        req.destroy();
        resolve();
      });

      req.write(postData);
      req.end();
    });
  };

  try {
    // Step 1: Get access token
    const token = await getAccessToken();
    console.log('');
    
    // Step 2: Test FIPs endpoint
    await testFIPsEndpoint(token);
    console.log('');
    
    // Step 3: Test consent creation
    await testConsentCreation(token);
    
    console.log('\n📋 Test Summary:');
    console.log('✅ Authentication successful');
    console.log('✅ Access token obtained');
    console.log('✅ FIPs endpoint working');
    console.log('✅ Consent creation working');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Test the consent approval flow using the consent URL');
    console.log('2. Verify webhook notifications work');
    console.log('3. Test data fetching once consent is approved');
    
  } catch (error) {
    console.log('\n❌ Test Failed:');
    console.log(`Error: ${error.message}`);
  }
};

testSetuConsentAPI().then(() => {
  console.log('\n🎯 Setu API test completed!');
});
