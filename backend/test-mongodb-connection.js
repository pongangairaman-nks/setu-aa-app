const mongoose = require('mongoose');

async function testMongoDBConnection() {
  console.log('🔍 MongoDB Connection Test');
  console.log('==========================');
  
  // Use the provided connection string
  const mongoUri = 'mongodb+srv://pongangairamannks:YjoqZ7eXTRu4seON@setuapp.67vbqqu.mongodb.net/?retryWrites=true&w=majority&appName=SetuApp';
  
  // Display connection string (masked)
  const maskedUri = mongoUri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1***:***@');
  console.log('📡 Connection String:', maskedUri);
  
  console.log('');
  console.log('🔧 Connection Options:');
  console.log('- Database: SetuApp');
  console.log('- Retry Writes: true');
  console.log('- W: majority');
  console.log('');
  
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Set connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    // Attempt connection
    const connection = await mongoose.connect(mongoUri, options);
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Connection Details:');
    console.log('- Host:', connection.connection.host);
    console.log('- Port:', connection.connection.port);
    console.log('- Database:', connection.connection.name);
    console.log('- Ready State:', connection.connection.readyState);
    
    // Test basic operations
    console.log('');
    console.log('🧪 Testing basic operations...');
    
    // Test a simple query
    const collections = await connection.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    // Test user collection specifically
    try {
      const userCount = await connection.connection.db.collection('users').countDocuments();
      console.log('👥 Users count:', userCount);
    } catch (err) {
      console.log('⚠️  Users collection test failed:', err.message);
    }
    
    // Test consent collection
    try {
      const consentCount = await connection.connection.db.collection('consents').countDocuments();
      console.log('📋 Consents count:', consentCount);
    } catch (err) {
      console.log('⚠️  Consents collection test failed:', err.message);
    }
    
    // Test accounts collection
    try {
      const accountCount = await connection.connection.db.collection('accounts').countDocuments();
      console.log('🏦 Accounts count:', accountCount);
    } catch (err) {
      console.log('⚠️  Accounts collection test failed:', err.message);
    }
    
    // Test transactions collection
    try {
      const transactionCount = await connection.connection.db.collection('transactions').countDocuments();
      console.log('💳 Transactions count:', transactionCount);
    } catch (err) {
      console.log('⚠️  Transactions collection test failed:', err.message);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed successfully');
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log('📊 Error Type:', error.name);
    console.log('💬 Error Message:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('');
      console.log('🔧 Troubleshooting Tips:');
      console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
      console.log('2. Verify the connection string is correct');
      console.log('3. Check if the database user has proper permissions');
      console.log('4. Ensure the cluster is running and accessible');
      console.log('');
      console.log('🌐 MongoDB Atlas IP Whitelist URL:');
      console.log('https://www.mongodb.com/docs/atlas/security-whitelist/');
    }
    
    if (error.code === 'EBADRESP') {
      console.log('');
      console.log('🔧 DNS Resolution Issue:');
      console.log('The error suggests DNS resolution problems with MongoDB Atlas.');
      console.log('This could be due to:');
      console.log('- Network connectivity issues');
      console.log('- DNS server problems');
      console.log('- Firewall blocking the connection');
    }
  }
}

async function testNetworkConnectivity() {
  console.log('');
  console.log('🌐 Network Connectivity Test');
  console.log('============================');
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    // Test DNS resolution
    console.log('🔍 Testing DNS resolution...');
    const dnsResult = await execAsync('nslookup _mongodb._tcp.setuapp.67vbqqu.mongodb.net');
    console.log('✅ DNS resolution successful');
    console.log(dnsResult.stdout);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
  }
  
  try {
    // Test ping to MongoDB Atlas
    console.log('🏓 Testing ping to MongoDB Atlas...');
    const pingResult = await execAsync('ping -c 3 setuapp.67vbqqu.mongodb.net');
    console.log('✅ Ping successful');
    console.log(pingResult.stdout);
  } catch (error) {
    console.log('❌ Ping failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting MongoDB Diagnostics');
  console.log('================================');
  
  await testMongoDBConnection();
  await testNetworkConnectivity();
  
  console.log('');
  console.log('🎉 Diagnostics completed!');
}

// Run the tests
main().catch(console.error);
