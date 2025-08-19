#!/bin/bash

# Setu AA Backend Deployment Script
# This script deploys the backend to AWS EC2 instance

echo "🚀 Starting Setu AA Backend Deployment..."

# Configuration
EC2_HOST="ec2-13-233-96-134.ap-south-1.compute.amazonaws.com"
EC2_USER="ec2-user"
PEM_FILE="/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem"
BACKEND_DIR="backend"
REMOTE_DIR="/home/ec2-user/setu-aa-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "EC2 Host: $EC2_HOST"
echo "Remote Directory: $REMOTE_DIR"
echo "Backend Directory: $BACKEND_DIR"

# Step 1: Create a temporary deployment package
echo -e "\n${YELLOW}📦 Creating deployment package...${NC}"
DEPLOY_DIR="deploy-temp"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy backend files (excluding node_modules and logs)
cp -r $BACKEND_DIR/* $DEPLOY_DIR/
rm -rf $DEPLOY_DIR/node_modules
rm -rf $DEPLOY_DIR/logs
rm -f $DEPLOY_DIR/.env

# Create deployment package
tar -czf backend-deploy.tar.gz -C $DEPLOY_DIR .

echo -e "${GREEN}✅ Deployment package created: backend-deploy.tar.gz${NC}"

# Step 2: Upload to EC2
echo -e "\n${YELLOW}📤 Uploading to EC2...${NC}"
scp -i "$PEM_FILE" backend-deploy.tar.gz $EC2_USER@$EC2_HOST:~/
scp -i "$PEM_FILE" $BACKEND_DIR/.env $EC2_USER@$EC2_HOST:~/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Upload successful${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    exit 1
fi

# Step 3: Deploy on EC2
echo -e "\n${YELLOW}🔧 Deploying on EC2...${NC}"
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << 'EOF'
    echo "📋 Starting deployment on EC2..."
    
    # Stop existing process if running
    if pgrep -f "node server.js" > /dev/null; then
        echo "🛑 Stopping existing server..."
        pkill -f "node server.js"
        sleep 2
    fi
    
    # Create/clean remote directory
    REMOTE_DIR="/home/ec2-user/setu-aa-backend"
    rm -rf $REMOTE_DIR
    mkdir -p $REMOTE_DIR
    
    # Extract deployment package
    echo "📦 Extracting deployment package..."
    tar -xzf ~/backend-deploy.tar.gz -C $REMOTE_DIR
    rm ~/backend-deploy.tar.gz
    
    # Navigate to project directory
    cd $REMOTE_DIR
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "📥 Installing Node.js..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    fi
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install --production
    
    # Copy the actual .env file from local to remote
    echo "📝 Copying .env file..."
    if [ -f ~/.env ]; then
        echo "✅ .env file found and copying to project directory"
        cp ~/.env .env
        rm ~/.env
    elif [ -f .env ]; then
        echo "✅ .env file found in project directory"
    else
        echo "⚠️  No .env file found, creating from env.example"
        cp env.example .env
        echo "⚠️  Please update the .env file with your actual configuration"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    # Set up PM2 for process management
    if ! command -v pm2 &> /dev/null; then
        echo "📥 Installing PM2..."
        npm install -g pm2
    fi
    
    # Start the application with PM2
    echo "🚀 Starting application with PM2..."
    pm2 delete setu-backend 2>/dev/null || true
    pm2 start server.js --name "setu-backend" --env production
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
    
    echo "✅ Deployment completed!"
    echo "📊 PM2 Status:"
    pm2 status
    echo ""
    echo "🌐 Your API will be available at:"
    echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
    echo ""
    echo "🔗 Webhook URL for Setu:"
    echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000/api/webhooks/setu"
EOF

# Step 4: Cleanup
echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
rm -rf $DEPLOY_DIR
rm -f backend-deploy.tar.gz

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. SSH into your EC2 instance and update the .env file with your actual configuration"
echo "2. Configure your security group to allow inbound traffic on port 5000"
echo "3. Update your Setu webhook URL to point to your EC2 instance"
echo ""
echo -e "${YELLOW}🔗 Useful commands:${NC}"
echo "SSH: ssh -i \"$PEM_FILE\" $EC2_USER@$EC2_HOST"
echo "View logs: pm2 logs setu-backend"
echo "Restart: pm2 restart setu-backend"
echo "Status: pm2 status"
