const { exec } = require('child_process');

console.log('🧪 Testing Direct Setu API Call with curl\n');

const testDirectCurl = () => {
  const curlCommand = `curl --request POST \\
  --url https://orgservice-prod.setu.co/v1/users/login \\
  --header 'Content-Type: application/json' \\
  --header 'client: bridge' \\
  --data '{
    "clientID": "b615a43a-e779-4d95-9ddb-768c7666d96b",
    "grant_type": "client_credentials",
    "secret": "eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM"
  }'`;

  console.log('🔗 Direct curl command:');
  console.log(curlCommand);
  console.log('');

  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Curl command failed:', error);
      return;
    }

    if (stderr) {
      console.error('⚠️ Curl stderr:', stderr);
    }

    console.log('📡 Direct curl response:');
    console.log(stdout);
    console.log('');

    try {
      const response = JSON.parse(stdout);
      console.log('✅ Parsed response:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.access_token) {
        console.log(`🎯 Token obtained: ${response.access_token.substring(0, 50)}...`);
        console.log(`⏰ Expires in: ${response.expires_in} seconds`);
        console.log(`📅 Token type: ${response.token_type}`);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
    }
  });
};

testDirectCurl();
