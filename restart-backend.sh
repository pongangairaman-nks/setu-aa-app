#!/bin/bash

# Restart Backend on EC2
echo "🔄 Restarting Setu AA Backend on EC2..."

# Configuration
EC2_HOST="ec2-13-233-96-134.ap-south-1.compute.amazonaws.com"
EC2_USER="ec2-user"
PEM_FILE="/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Restart Configuration:${NC}"
echo "EC2 Host: $EC2_HOST"
echo "PEM File: $PEM_FILE"

# Restart the backend service
echo -e "\n${YELLOW}🔄 Restarting backend service...${NC}"
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << 'EOF'
    echo "🔄 Restarting Setu Backend..."
    
    # Check current status
    echo "📊 Current PM2 status:"
    pm2 status
    
    # Restart the backend
    echo "🔄 Restarting setu-backend..."
    pm2 restart setu-backend
    
    # Wait a moment for restart
    sleep 3
    
    # Check new status
    echo "📊 New PM2 status:"
    pm2 status
    
    # Show recent logs
    echo "📋 Recent logs:"
    pm2 logs setu-backend --lines 20
    
    echo "✅ Restart completed!"
EOF

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Backend restart successful${NC}"
    echo -e "${YELLOW}🧪 Testing the API in 5 seconds...${NC}"
    sleep 5
    
    # Test the health endpoint
    echo "🔍 Testing health endpoint..."
    curl -s https://hedgrpay.com/health | jq '.' 2>/dev/null || curl -s https://hedgrpay.com/health
    
    echo -e "\n${YELLOW}🔐 Testing login API...${NC}"
    curl -s -X POST https://hedgrpay.com/api/auth/login \
         -H "Content-Type: application/json" \
         -d '{"email": "pon04@gmail.com", "password": "Pass123"}' | \
         jq '.' 2>/dev/null || \
         curl -s -X POST https://hedgrpay.com/api/auth/login \
         -H "Content-Type: application/json" \
         -d '{"email": "pon04@gmail.com", "password": "Pass123"}'
    
else
    echo -e "\n${RED}❌ Restart failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Backend restart process completed!${NC}"
