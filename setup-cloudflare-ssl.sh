#!/bin/bash

# Setu AA Backend SSL Setup with Cloudflare
# This script sets up SSL using Cloudflare (easier alternative)

echo "☁️ Setting up SSL with Cloudflare for Setu AA Backend..."

# Configuration
EC2_HOST="ec2-13-233-96-134.ap-south-1.compute.amazonaws.com"
EC2_USER="ec2-user"
PEM_FILE="/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Cloudflare SSL Setup:${NC}"
echo "This is the EASIEST way to get HTTPS working immediately!"
echo ""
echo -e "${YELLOW}🔧 Steps to follow:${NC}"
echo "1. Go to https://cloudflare.com and create a free account"
echo "2. Add your domain (or use a subdomain of your existing domain)"
echo "3. Update DNS to point to your EC2 IP: 13.233.96.134"
echo "4. Enable Cloudflare proxy (orange cloud)"
echo "5. SSL/TLS will be automatically enabled"

echo -e "\n${YELLOW}📝 Manual DNS Setup:${NC}"
echo "If you don't have a domain, you can:"
echo "1. Register a cheap domain (~$10/year) from Namecheap/GoDaddy"
echo "2. Or use a free subdomain service"
echo "3. Point it to your EC2 IP: 13.233.96.134"

echo -e "\n${YELLOW}🔧 Alternative: Quick Domain Setup${NC}"
echo "You can quickly get a domain and set it up:"
echo "1. Go to https://freenom.com (free domains)"
echo "2. Register a free .tk, .ml, .ga, .cf, or .gq domain"
echo "3. Point it to 13.233.96.134"
echo "4. Add to Cloudflare"

echo -e "\n${YELLOW}⚡ Quick Setup Commands:${NC}"
echo "Once you have a domain pointing to your EC2:"
echo "1. Add domain to Cloudflare"
echo "2. Enable proxy (orange cloud)"
echo "3. Set SSL/TLS to 'Flexible'"
echo "4. Your HTTPS will work immediately!"

echo -e "\n${GREEN}✅ Benefits of Cloudflare:${NC}"
echo "• Free SSL certificate"
echo "• DDoS protection"
echo "• CDN for faster loading"
echo "• Automatic HTTPS redirect"
echo "• No server configuration needed"
echo "• Works with any domain"

echo -e "\n${YELLOW}🔗 Example URLs after setup:${NC}"
echo "HTTPS API: https://yourdomain.com"
echo "HTTPS Health: https://yourdomain.com/health"
echo "HTTPS Callback: https://yourdomain.com/api/consents/callback"
echo "HTTPS Webhook: https://yourdomain.com/api/webhooks/setu"

echo -e "\n${YELLOW}📞 Need help?${NC}"
echo "1. Cloudflare setup guide: https://support.cloudflare.com/hc/en-us/articles/201720164-Creating-a-Cloudflare-account-and-adding-a-website"
echo "2. DNS setup guide: https://support.cloudflare.com/hc/en-us/articles/200168246-Adding-a-new-domain-to-Cloudflare"
echo "3. SSL setup guide: https://support.cloudflare.com/hc/en-us/articles/200170416-What-do-the-SSL-options-mean-"
