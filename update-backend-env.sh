#!/bin/bash

echo "🔧 Updating Backend Environment Variables..."

# Configuration
EC2_HOST="ec2-13-233-96-134.ap-south-1.compute.amazonaws.com"
EC2_USER="ec2-user"
PEM_FILE="/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem"
REMOTE_DIR="/home/ec2-user/setu-aa-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Updating Setu credentials on backend...${NC}"

# SSH into EC2 and update the .env file
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << 'EOF'
    cd /home/ec2-user/setu-aa-backend
    
    echo "📝 Updating .env file with correct Setu credentials..."
    
    # Create new .env file with correct credentials
    cat > .env << 'ENVFILE'
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/setu-aa-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Setu API Configuration - Updated with working credentials
SETU_BASE_URL=https://fiu.setu.co
SETU_CLIENT_ID=b615a43a-e779-4d95-9ddb-768c7666d96b
SETU_CLIENT_SECRET=eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM
SETU_PRODUCT_ID=e02807a8-2588-4306-83d2-5eb1e615abda
SETU_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----
SETU_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nYour public key here\n-----END PUBLIC KEY-----
SETU_AA_HANDLE=your-aa-handle
SETU_WEBHOOK_SECRET=your-webhook-secret

# Frontend URLs (for CORS)
FRONTEND_URL=https://hedgrpay.com
EXPO_URL=http://localhost:19006

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Data Retention (in days)
DATA_RETENTION_DAYS=180

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration (optional, for caching)
REDIS_URL=redis://localhost:6379

# AWS Configuration (optional, for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
ENVFILE

    echo "✅ .env file updated successfully"
    
    # Restart the backend to pick up new environment variables
    echo "🔄 Restarting backend with new credentials..."
    pm2 restart setu-backend
    
    echo "📊 PM2 Status:"
    pm2 status
    
    echo "📋 Updated Setu Configuration:"
    echo "SETU_BASE_URL: https://fiu.setu.co"
    echo "SETU_CLIENT_ID: b615a43a-e779-4d95-9ddb-768c7666d96b"
    echo "SETU_CLIENT_SECRET: eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM"
    echo "SETU_PRODUCT_ID: e02807a8-2588-4306-83d2-5eb1e615abda"
EOF

echo -e "\n${GREEN}✅ Backend environment updated successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Test the Setu API proxy routes again"
echo "2. Verify authentication works with new credentials"
echo "3. Test the mobile app integration"
