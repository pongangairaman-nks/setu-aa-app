#!/bin/bash

# Configuration
PEM_FILE="/Users/pongangairaman/Desktop/workspace/poc/setu-aa-mobile-app/setu-backend.pem"
EC2_HOST="13.233.96.134"
EC2_USER="ec2-user"

echo "🔄 Updating backend to use sandbox environment..."

# Update the backend files with sandbox URLs
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << 'EOF'
    echo "📂 Navigating to backend directory..."
    cd /home/ec2-user/setu-aa-backend
    
    echo "🔧 Updating setuRoutes.js with sandbox URLs..."
    sed -i 's|https://orgservice-prod.setu.co|https://orgservice-sandbox.setu.co|g' src/routes/setuRoutes.js
    sed -i 's|https://fiu.setu.co|https://fiu-sandbox.setu.co|g' src/routes/setuRoutes.js
    
    echo "🔧 Updating authRoutes.js with sandbox URLs..."
    sed -i 's|https://orgservice-prod.setu.co|https://orgservice-sandbox.setu.co|g' src/routes/authRoutes.js
    
    echo "🔄 Restarting PM2 process..."
    pm2 restart setu-backend
    
    echo "📊 PM2 Status:"
    pm2 status
    
    echo "📋 Backend logs (last 10 lines):"
    pm2 logs setu-backend --lines 10
    
    echo "✅ Backend updated to sandbox environment!"
EOF

echo "🎯 Backend update script completed!"
