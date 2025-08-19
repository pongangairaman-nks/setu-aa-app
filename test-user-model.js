const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Test bcrypt functionality
async function testBcrypt() {
  console.log('🧪 Testing bcrypt functionality...');
  
  try {
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('✅ bcrypt test successful');
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    console.log('Password length:', hashedPassword.length);
    
    // Test password comparison
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Password comparison test:', isValid ? '✅ PASS' : '❌ FAIL');
    
    return true;
  } catch (error) {
    console.error('❌ bcrypt test failed:', error);
    return false;
  }
}

// Test User model creation
async function testUserModel() {
  console.log('\n🧪 Testing User model creation...');
  
  try {
    // Connect to MongoDB
    const mongoURI = 'mongodb+srv://pongangairamannks:YjoqZ7eXTRu4seON@setuapp.67vbqqu.mongodb.net/?retryWrites=true&w=majority&appName=SetuApp';
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Define a simple user schema for testing
    const testUserSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
      },
      password: {
        type: String,
        required: true,
        minlength: 6
      },
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      }
    }, {
      timestamps: true
    });
    
    // Add pre-save middleware
    testUserSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      
      try {
        console.log('🔐 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('✅ Password hashed successfully');
        next();
      } catch (error) {
        console.error('❌ Password hashing error:', error);
        next(error);
      }
    });
    
    const TestUser = mongoose.model('TestUser', testUserSchema);
    
    // Test user creation
    console.log('👤 Creating test user...');
    const testUser = new TestUser({
      email: 'test-model@example.com',
      password: 'password123',
      name: 'Test Model User'
    });
    
    console.log('💾 Saving user to database...');
    await testUser.save();
    
    console.log('✅ User created successfully!');
    console.log('User ID:', testUser._id);
    console.log('Email:', testUser.email);
    console.log('Name:', testUser.name);
    console.log('Password (hashed):', testUser.password);
    console.log('Created at:', testUser.createdAt);
    
    // Clean up - delete the test user
    console.log('🧹 Cleaning up test user...');
    await TestUser.deleteOne({ email: 'test-model@example.com' });
    console.log('✅ Test user deleted');
    
    return true;
  } catch (error) {
    console.error('❌ User model test failed:', error);
    return false;
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📡 MongoDB connection closed');
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting User Model Tests\n');
  
  const bcryptTest = await testBcrypt();
  const userModelTest = await testUserModel();
  
  console.log('\n📋 Test Results:');
  console.log('bcrypt test:', bcryptTest ? '✅ PASS' : '❌ FAIL');
  console.log('User model test:', userModelTest ? '✅ PASS' : '❌ FAIL');
  
  if (bcryptTest && userModelTest) {
    console.log('\n🎉 All tests passed! The issue might be elsewhere.');
  } else {
    console.log('\n❌ Some tests failed. This might be the root cause.');
  }
}

runTests().catch(console.error);
