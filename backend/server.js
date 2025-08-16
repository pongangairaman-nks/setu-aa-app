require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/database');
const corsOptions = require('./src/config/cors');
const logger = require('./src/utils/logger');
const dataCleanup = require('./src/utils/dataCleanup');

// Import routes
const consentRoutes = require('./src/routes/consentRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const setuRoutes = require('./src/routes/setuRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB(); // Enable database connection

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test Setu configuration endpoint
app.get('/test-setu', (req, res) => {
  const setuService = require('./src/services/setuService');
  
  try {
    // Test private key format
    const privateKey = process.env.SETU_PRIVATE_KEY?.replace(/\\n/g, '\n');
    console.log('Private key length:', privateKey ? privateKey.length : 0);
    console.log('Private key starts with:', privateKey ? privateKey.substring(0, 50) : 'Not found');
    
    // Test JWT generation
    const jwt = setuService.generateJWT();
    
    const setuConfig = {
      baseURL: process.env.SETU_BASE_URL,
      clientId: process.env.SETU_CLIENT_ID ? 'Configured' : 'Not configured',
      clientSecret: process.env.SETU_CLIENT_SECRET ? 'Configured' : 'Not configured',
      productId: process.env.SETU_PRODUCT_ID,
      privateKey: process.env.SETU_PRIVATE_KEY?.replace(/\\n/g, '\n') ? 'Configured' : 'Not configured',
             publicKey: process.env.SETU_PUBLIC_KEY?.replace(/\\n/g, '\n') ? 'Configured' : 'Not configured',
      aaHandle: process.env.SETU_AA_HANDLE,
      webhookSecret: process.env.SETU_WEBHOOK_SECRET ? 'Configured' : 'Not configured',
      jwtGenerated: jwt ? 'Success' : 'Failed'
    };
    
    res.json({
      success: true,
      message: 'Setu configuration status',
      config: setuConfig
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Setu configuration test failed',
      error: error.message
    });
  }
});

// API routes
app.use('/api/consents', consentRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/setu', setuRoutes); // Add Setu API proxy routes

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start data cleanup scheduler
  dataCleanup.startCleanupScheduler();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; 