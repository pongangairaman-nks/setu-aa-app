const https = require('https');

// Function to make HTTPS request with auth
function makeAuthenticatedRequest(url, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
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

async function checkRawData() {
  try {
    console.log('🔍 Checking Raw Data Structure...\n');

    // Your JWT token from the app
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE0YWZlZjU1OWVmNDM3ZDQ1OTA0YjEiLCJlbWFpbCI6InBvbjAzQGdtYWlsLmNvbSIsImlhdCI6MTc1NTcyMTA5OSwiZXhwIjoxNzU1ODA3NDk5fQ.kVXTcFoQlHRr7VGmO_hg7zOEIHwG_bHvKUbERtQjC8E';
    const sessionId = '4422328f-5ee4-439a-89df-cbfb6795295c';

    console.log('1. Getting raw Setu data...\n');

    // Get the raw Setu data
    const backendResponse = await makeAuthenticatedRequest(
      `https://hedgrpay.com/api/setu/sessions/${sessionId}/data`,
      'GET',
      null,
      token
    );
    
    if (backendResponse.statusCode === 200) {
      const setuData = JSON.parse(backendResponse.data);
      console.log(`   ✅ Got Setu data successfully!`);
      console.log(`   Status: ${setuData.status}`);
      console.log(`   FIPs: ${setuData.fips ? setuData.fips.length : 0}\n`);

      // Analyze the data structure
      if (setuData.fips && setuData.fips.length > 0) {
        const fip = setuData.fips[0];
        console.log(`   📊 FIP Structure:`);
        console.log(`     FIP ID: ${fip.fipID}`);
        console.log(`     Accounts: ${fip.accounts ? fip.accounts.length : 0}\n`);

        if (fip.accounts && fip.accounts.length > 0) {
          const account = fip.accounts[0];
          console.log(`   📋 Account Structure:`);
          console.log(`     Link Ref Number: ${account.linkRefNumber}`);
          console.log(`     Masked Acc Number: ${account.maskedAccNumber}`);
          console.log(`     FI Status: ${account.FIstatus}`);
          console.log(`     Data Present: ${account.data ? 'Yes' : 'No'}\n`);

          if (account.data) {
            console.log(`   📄 Account Data Keys:`);
            console.log(`     Keys in account.data: ${Object.keys(account.data).join(', ')}\n`);

            if (account.data.account) {
              console.log(`   🏦 Account Object Keys:`);
              console.log(`     Keys in account.data.account: ${Object.keys(account.data.account).join(', ')}\n`);

              if (account.data.account.summary) {
                console.log(`   💰 Summary Data:`);
                console.log(`     ${JSON.stringify(account.data.account.summary, null, 2)}\n`);
              }

              if (account.data.account.profile) {
                console.log(`   👤 Profile Data:`);
                console.log(`     ${JSON.stringify(account.data.account.profile, null, 2)}\n`);
              }

              if (account.data.account.transactions) {
                console.log(`   💳 Transaction Structure:`);
                console.log(`     Keys in transactions: ${Object.keys(account.data.account.transactions).join(', ')}`);
                if (account.data.account.transactions.transaction) {
                  console.log(`     Transaction count: ${account.data.account.transactions.transaction.length}`);
                  console.log(`     First transaction: ${JSON.stringify(account.data.account.transactions.transaction[0], null, 2)}`);
                }
              }
            } else {
              console.log(`   ❌ No account object found in account.data`);
              console.log(`   🔍 Available keys: ${Object.keys(account.data).join(', ')}`);
            }
          }
        }
      }
    }

    console.log('\n✅ Raw data structure check completed!');

  } catch (error) {
    console.error('❌ Error checking raw data:', error.message);
  }
}

checkRawData();
