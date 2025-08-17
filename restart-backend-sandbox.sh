#!/bin/bash

# Configuration
PEM_FILE="/Users/pongangairaman/Desktop/workspace/poc/setu-aa-mobile-app/setu-backend.pem"
EC2_HOST="13.233.96.134"
EC2_USER="ec2-user"

echo "🔄 Restarting backend with sandbox configuration..."

# SSH into EC2 and restart the backend
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << 'EOF'
    echo "📂 Navigating to backend directory..."
    cd /home/ec2-user/setu-aa-backend
    
    echo "🔄 Restarting PM2 process..."
    pm2 restart setu-backend
    
    echo "📊 PM2 Status:"
    pm2 status
    
    echo "📋 Backend logs (last 10 lines):"
    pm2 logs setu-backend --lines 10
    
    echo "✅ Backend restart completed!"
EOF

echo "🎯 Backend restart script completed!"
