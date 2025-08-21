const mongoose = require('mongoose');

async function testSimpleConnection() {
  console.log('🔄 Simple MongoDB Connection Test');
  console.log('=================================');
  
  const mongoUri = 'mongodb+srv://pongangairamannks:YjoqZ7eXTRu4seON@setuapp.67vbqqu.mongodb.net/?retryWrites=true&w=majority&appName=SetuApp';
  
  // Try with minimal options first
  const simpleOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  
  console.log('🔄 Attempting connection with minimal options...');
  
  try {
    await mongoose.connect(mongoUri, simpleOptions);
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections found:', collections.length);
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    return true;
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('🔧 Trying with SSL options...');
    
    // Try with SSL options
    const sslOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: false
    };
    
    try {
      await mongoose.connect(mongoUri, sslOptions);
      console.log('✅ MongoDB connection successful with SSL options!');
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📚 Collections found:', collections.length);
      
      await mongoose.connection.close();
      console.log('🔌 Connection closed');
      return true;
      
    } catch (sslError) {
      console.log('❌ SSL connection also failed:', sslError.message);
      return false;
    }
  }
}

async function testLoginNow() {
  console.log('');
  console.log('🔐 Testing Login API');
  console.log('===================');
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    const result = await execAsync(`curl -s -X POST https://hedgrpay.com/api/auth/login -H "Content-Type: application/json" -d '{"email": "pon04@gmail.com", "password": "Pass123"}'`);
    
    console.log('📄 Login Response:', result.stdout);
    
    if (result.stdout.includes('token')) {
      console.log('✅ Login API is working!');
      return true;
    } else {
      console.log('❌ Login still failing');
      return false;
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing MongoDB and APIs');
  console.log('===========================');
  
  const mongoWorking = await testSimpleConnection();
  
  if (mongoWorking) {
    console.log('');
    console.log('🎉 MongoDB is working! Testing login API...');
    await testLoginNow();
  } else {
    console.log('');
    console.log('⚠️  MongoDB still not working. Login API will likely fail.');
  }
}

main().catch(console.error);
