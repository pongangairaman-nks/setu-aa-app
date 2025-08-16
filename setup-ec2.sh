#!/bin/bash

# EC2 Setup Script for Setu AA Backend
# Run this script on your EC2 instance after first login

echo "🔧 Setting up EC2 instance for Setu AA Backend..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 18.x
echo "📥 Installing Node.js 18.x..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
echo "📥 Installing PM2..."
sudo npm install -g pm2

# Install nginx for reverse proxy (optional)
echo "📥 Installing nginx..."
sudo yum install -y nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow SSH, HTTP, HTTPS, and our app port
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload

# Create nginx configuration for reverse proxy
echo "📝 Creating nginx configuration..."
sudo tee /etc/nginx/conf.d/setu-backend.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ec2-user/setu-aa-backend
cd /home/ec2-user/setu-aa-backend

# Set up PM2 startup
echo "⚙️ Setting up PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "✅ EC2 setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy your backend code using the deployment script"
echo "2. Configure your .env file with actual values"
echo "3. Start the application with: pm2 start ecosystem.config.js --env production"
echo ""
echo "🌐 Your application will be available at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "🔗 Webhook URL for Setu:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api/webhooks/setu"
