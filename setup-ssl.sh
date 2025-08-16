#!/bin/bash

# Setu AA Backend SSL Setup Script
# This script sets up SSL certificates using Let's Encrypt and Certbot

echo "🔒 Setting up SSL for Setu AA Backend..."

# Configuration
EC2_HOST="ec2-13-233-96-134.ap-south-1.compute.amazonaws.com"
EC2_USER="ec2-user"
PEM_FILE="/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem"
DOMAIN="13.233.96.134.nip.io"  # Using nip.io for IP-based domain

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 SSL Configuration:${NC}"
echo "EC2 Host: $EC2_HOST"
echo "Domain: $DOMAIN"
echo "Email: your-email@example.com (update this)"

# Step 1: SSH into EC2 and set up SSL
echo -e "\n${YELLOW}🔧 Setting up SSL on EC2...${NC}"
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << 'EOF'
    echo "🔒 Starting SSL setup..."
    
    # Update system
    sudo yum update -y
    
    # Install EPEL repository
    sudo yum install -y epel-release
    
    # Install Certbot
    sudo yum install -y certbot python3-certbot-nginx
    
    # Install Nginx (for SSL termination)
    sudo yum install -y nginx
    
    # Create Nginx configuration for SSL termination
    sudo tee /etc/nginx/conf.d/setu-backend.conf > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name 13.233.96.134.nip.io;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name 13.233.96.134.nip.io;
    
    # SSL configuration will be added by Certbot
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF
    
    # Start Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Open firewall ports
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    
    echo "✅ Nginx configured and started"
EOF

# Step 2: Get SSL certificate
echo -e "\n${YELLOW}📜 Getting SSL certificate...${NC}"
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << 'EOF'
    # Get SSL certificate (replace with your email)
    sudo certbot --nginx -d 13.233.96.134.nip.io --non-interactive --agree-tos --email your-email@example.com
    
    # Test certificate renewal
    sudo certbot renew --dry-run
    
    # Restart Nginx
    sudo systemctl restart nginx
    
    echo "✅ SSL certificate obtained and configured"
EOF

# Step 3: Update backend to work with SSL
echo -e "\n${YELLOW}🔧 Updating backend configuration...${NC}"
ssh -i "$PEM_FILE" $EC2_USER@$EC2_HOST << 'EOF'
    # Navigate to backend directory
    cd /home/ec2-user/setu-aa-backend
    
    # Update PM2 to use HTTPS
    pm2 stop setu-backend
    
    # Restart with new configuration
    pm2 start server.js --name "setu-backend" --env production
    
    # Save PM2 configuration
    pm2 save
    
    echo "✅ Backend restarted with SSL support"
EOF

echo -e "\n${GREEN}🎉 SSL setup completed!${NC}"
echo -e "${YELLOW}📝 Important URLs:${NC}"
echo "HTTPS API: https://13.233.96.134.nip.io"
echo "HTTPS Health Check: https://13.233.96.134.nip.io/health"
echo "HTTPS Callback: https://13.233.96.134.nip.io/api/consents/callback"
echo "HTTPS Webhook: https://13.233.96.134.nip.io/api/webhooks/setu"

echo -e "\n${YELLOW}🔧 Next Steps:${NC}"
echo "1. Update Setu dashboard with HTTPS URLs"
echo "2. Test the HTTPS endpoints"
echo "3. Monitor SSL certificate renewal (automatic)"

echo -e "\n${YELLOW}🔗 Useful commands:${NC}"
echo "SSH: ssh -i \"$PEM_FILE\" $EC2_USER@$EC2_HOST"
echo "Check SSL: sudo certbot certificates"
echo "Renew SSL: sudo certbot renew"
echo "Nginx logs: sudo tail -f /var/log/nginx/error.log"
