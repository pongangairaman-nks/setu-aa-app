# 🔒 SSL Setup Guide for Setu AA Backend

## 🎯 Problem
Setu dashboard requires HTTPS URLs, but your current backend runs on HTTP (`http://13.233.96.134:5000`).

## 🚀 Solution Options

### Option 1: Cloudflare (Recommended - Easiest) ⭐
**Best for: Quick setup, no server changes, additional benefits**

#### ✅ Advantages
- **Free SSL certificate**
- **DDoS protection**
- **CDN for faster loading**
- **No server configuration needed**
- **Automatic HTTPS redirect**
- **Works with any domain**

#### 🔧 Setup Steps
1. **Get a domain** (free or cheap):
   - Free domains: https://freenom.com (.tk, .ml, .ga, .cf, .gq)
   - Cheap domains: Namecheap, GoDaddy (~$10/year)
   - Or use a subdomain of your existing domain

2. **Point domain to your EC2**:
   ```
   A Record: yourdomain.com → 13.233.96.134
   ```

3. **Add to Cloudflare**:
   - Go to https://cloudflare.com
   - Create free account
   - Add your domain
   - Enable proxy (orange cloud)
   - Set SSL/TLS to "Flexible"

4. **Done!** Your HTTPS will work immediately.

#### 🔗 Result URLs
```
HTTPS API: https://yourdomain.com
HTTPS Callback: https://yourdomain.com/api/consents/callback
HTTPS Webhook: https://yourdomain.com/api/webhooks/setu
```

---

### Option 2: Let's Encrypt with Certbot (Advanced)
**Best for: Full control, no third-party dependencies**

#### ✅ Advantages
- **Free SSL certificate**
- **Automatic renewal**
- **Full control over SSL**
- **No external dependencies**

#### 🔧 Setup Steps
1. **Run the SSL setup script**:
   ```bash
   chmod +x setup-ssl.sh
   ./setup-ssl.sh
   ```

2. **Update the email in the script** before running

3. **The script will**:
   - Install Nginx and Certbot
   - Get SSL certificate from Let's Encrypt
   - Configure SSL termination
   - Set up automatic renewal

#### 🔗 Result URLs
```
HTTPS API: https://13.233.96.134.nip.io
HTTPS Callback: https://13.233.96.134.nip.io/api/consents/callback
HTTPS Webhook: https://13.233.96.134.nip.io/api/webhooks/setu
```

---

### Option 3: AWS Certificate Manager (AWS Native)
**Best for: AWS integration, managed certificates**

#### ✅ Advantages
- **Free SSL certificate**
- **AWS managed**
- **Automatic renewal**
- **Load balancer integration**

#### 🔧 Setup Steps
1. **Create Application Load Balancer**:
   - Go to EC2 → Load Balancers
   - Create ALB
   - Configure HTTPS listener
   - Request certificate from ACM

2. **Update security group**:
   - Allow HTTPS (443) traffic

3. **Update DNS** to point to ALB

---

## 🎯 Quick Start (Recommended)

### Step 1: Get a Free Domain
```bash
# Option A: Free domain from Freenom
1. Go to https://freenom.com
2. Register free domain (.tk, .ml, .ga, .cf, .gq)
3. Point to your EC2 IP: 13.233.96.134

# Option B: Use subdomain
1. Use a subdomain of your existing domain
2. Point to your EC2 IP: 13.233.96.134
```

### Step 2: Set Up Cloudflare
```bash
1. Go to https://cloudflare.com
2. Create free account
3. Add your domain
4. Enable proxy (orange cloud)
5. Set SSL/TLS to "Flexible"
```

### Step 3: Test HTTPS
```bash
# Test your endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/api/consents/callback
```

### Step 4: Update Setu Dashboard
```
Redirect URL: https://yourdomain.com/api/consents/callback
Webhook URL: https://yourdomain.com/api/webhooks/setu
```

---

## 🧪 Testing SSL Setup

### Test Scripts
```bash
# Test HTTPS health check
curl -k https://yourdomain.com/health

# Test HTTPS callback
curl -k https://yourdomain.com/api/consents/callback?consentId=test&status=ACTIVE

# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Create HTTPS Test Script
```bash
# Create test-https.js
const https = require('https');

const testHTTPS = () => {
  const options = {
    hostname: 'yourdomain.com',
    port: 443,
    path: '/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`SSL: ${res.socket.authorized ? 'Valid' : 'Invalid'}`);
  });

  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
  });

  req.end();
};

testHTTPS();
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. SSL Certificate Not Valid
```bash
# Check certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# For Cloudflare: Check SSL/TLS setting is "Flexible"
```

#### 2. Domain Not Resolving
```bash
# Check DNS
nslookup yourdomain.com
dig yourdomain.com

# Verify it points to your EC2 IP
```

#### 3. Backend Not Accessible
```bash
# Check if backend is running
ssh -i your-key.pem ec2-user@13.233.96.134
pm2 status

# Check firewall
sudo firewall-cmd --list-all
```

#### 4. Cloudflare Issues
```bash
# Check Cloudflare status
# Ensure proxy is enabled (orange cloud)
# Check SSL/TLS setting is "Flexible"
```

---

## 📋 Checklist

### Before Setup
- [ ] Choose SSL solution (Cloudflare recommended)
- [ ] Get domain or subdomain
- [ ] Point DNS to EC2 IP (13.233.96.134)

### After Setup
- [ ] Test HTTPS endpoints
- [ ] Verify SSL certificate
- [ ] Update Setu dashboard URLs
- [ ] Test complete flow
- [ ] Monitor for issues

### Production Checklist
- [ ] SSL certificate valid
- [ ] HTTPS redirect working
- [ ] All endpoints accessible via HTTPS
- [ ] Setu dashboard updated
- [ ] Mobile app deep links working
- [ ] Monitoring and logging configured

---

## 🎉 Result

After setup, you'll have:
- ✅ **HTTPS URLs** that Setu accepts
- ✅ **Secure communication** for all API calls
- ✅ **Professional setup** with valid SSL certificates
- ✅ **Automatic renewal** (Cloudflare/Let's Encrypt)
- ✅ **Additional security** (DDoS protection with Cloudflare)

**Your Setu integration will now work perfectly with HTTPS!** 🔒✨
