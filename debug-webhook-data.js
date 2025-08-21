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

async function debugWebhookData() {
  try {
    console.log('🔍 Debugging Webhook Data Processing...\n');

    // Your JWT token from the app
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE0YWZlZjU1OWVmNDM3ZDQ1OTA0YjEiLCJlbWFpbCI6InBvbjAzQGdtYWlsLmNvbSIsImlhdCI6MTc1NTcyMTA5OSwiZXhwIjoxNzU1ODA3NDk5fQ.kVXTcFoQlHRr7VGmO_hg7zOEIHwG_bHvKUbERtQjC8E';
    const sessionId = '4422328f-5ee4-439a-89df-cbfb6795295c';

    console.log('1. Getting raw Setu data to analyze structure...\n');

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
        console.log(`   📊 FIP Analysis:`);
        console.log(`     FIP ID: ${fip.fipID}`);
        console.log(`     Accounts: ${fip.accounts ? fip.accounts.length : 0}\n`);

        if (fip.accounts && fip.accounts.length > 0) {
          const account = fip.accounts[0];
          console.log(`   📋 Account Structure Analysis:`);
          console.log(`     Link Ref Number: ${account.linkRefNumber}`);
          console.log(`     Masked Acc Number: ${account.maskedAccNumber}`);
          console.log(`     FI Status: ${account.FIstatus}`);
          console.log(`     Data Present: ${account.data ? 'Yes' : 'No'}\n`);

          if (account.data) {
            console.log(`   📄 Account Data Structure:`);
            console.log(`     Account Object: ${account.data.account ? 'Present' : 'Missing'}`);
            console.log(`     Summary: ${account.data.summary ? 'Present' : 'Missing'}`);
            console.log(`     Profile: ${account.data.profile ? 'Present' : 'Missing'}`);
            console.log(`     Transactions: ${account.data.transactions ? 'Present' : 'Missing'}\n`);

            if (account.data.transactions) {
              console.log(`   💳 Transaction Structure:`);
              console.log(`     Transaction Array: ${account.data.transactions.transaction ? 'Present' : 'Missing'}`);
              if (account.data.transactions.transaction) {
                console.log(`     Transaction Count: ${account.data.transactions.transaction.length}`);
                console.log(`     First Transaction: ${JSON.stringify(account.data.transactions.transaction[0], null, 2)}`);
              }
            }

            if (account.data.profile) {
              console.log(`   👤 Profile Structure:`);
              console.log(`     Profile: ${JSON.stringify(account.data.profile, null, 2)}`);
            }
          }
        }
      }
    }

    console.log('\n2. Simulating webhook processing logic...\n');

    // Simulate the webhook processing logic
    const setuData = JSON.parse(backendResponse.data);
    if (setuData.fips && setuData.fips.length > 0) {
      let allAccounts = [];
      let allTransactions = [];
      let userProfile = null;

      console.log(`   🔄 Processing ${setuData.fips.length} FIPs...`);

      for (const fip of setuData.fips) {
        console.log(`     📊 Processing FIP: ${fip.fipID}`);
        console.log(`     📋 Processing ${fip.accounts ? fip.accounts.length : 0} accounts...`);

        for (const account of fip.accounts) {
          console.log(`       🏦 Processing account: ${account.maskedAccNumber}`);

          // Extract profile information from first account
          if (!userProfile && account.data?.profile) {
            userProfile = account.data.profile;
            console.log(`         ✅ Profile extracted`);
          }

          // Prepare account data
          const accountData = {
            linkRefNumber: account.linkRefNumber,
            maskedAccNumber: account.maskedAccNumber,
            accType: account.accType,
            fiType: account.fiType,
            fipId: account.fipId,
            fiStatus: account.FIstatus,
            fiStatusDescription: account.description,
            status: 'ACTIVE',
            lastUpdated: new Date(),
            summary: account.data?.summary || null,
            profile: account.data?.profile || null
          };

          allAccounts.push(accountData);
          console.log(`         ✅ Account data prepared`);

          // Process transactions if available
          if (account.data?.transactions?.transaction && Array.isArray(account.data.transactions.transaction)) {
            console.log(`         💳 Processing ${account.data.transactions.transaction.length} transactions...`);

            for (const transaction of account.data.transactions.transaction) {
              const transactionData = {
                linkRefNumber: account.linkRefNumber,
                transactionId: transaction.txnId,
                amount: transaction.amount,
                currency: transaction.currency || 'INR',
                type: transaction.type,
                description: transaction.narration,
                timestamp: new Date(transaction.transactionTimestamp),
                valueDate: new Date(transaction.valueDate),
                status: 'SUCCESS',
                mode: transaction.mode,
                reference: transaction.reference,
                currentBalance: transaction.currentBalance,
                lastUpdated: new Date()
              };

              allTransactions.push(transactionData);
            }
            console.log(`         ✅ ${account.data.transactions.transaction.length} transactions processed`);
          } else {
            console.log(`         ⚠️  No transactions found or invalid structure`);
          }
        }
      }

      console.log(`\n   📊 Processing Summary:`);
      console.log(`     Accounts: ${allAccounts.length}`);
      console.log(`     Transactions: ${allTransactions.length}`);
      console.log(`     Profile: ${userProfile ? 'Present' : 'Null'}`);

      if (allAccounts.length > 0) {
        console.log(`     ✅ Data processing successful!`);
        console.log(`     📋 First account: ${allAccounts[0].maskedAccNumber}`);
        console.log(`     💰 Balance: ${allAccounts[0].summary?.currentBalance || 'N/A'}`);
      } else {
        console.log(`     ❌ No accounts processed`);
      }
    }

    console.log('\n✅ Webhook data debugging completed!');

  } catch (error) {
    console.error('❌ Error debugging webhook data:', error.message);
  }
}

debugWebhookData();
