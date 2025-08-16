# 🔒 SSL Setup for Hostinger Domain + EC2 Instance

## 🎯 Your Setup
- **Domain**: Hostinger (you already have this)
- **Server**: AWS EC2 (13.233.96.134:5000)
- **Goal**: HTTPS URLs for Setu dashboard

## 🚀 Recommended Solution: Cloudflare (Best for Hostinger)

### ⭐ Why Cloudflare is Better for Your Setup?

1. **No DNS Provider Changes**: Works with Hostinger DNS
2. **Free SSL Certificate**: No additional cost
3. **DDoS Protection**: Extra security for your API
4. **CDN**: Faster loading for your users
5. **Easy Setup**: 5-minute configuration
6. **No Server Changes**: Zero downtime

## 🔧 Step-by-Step Setup

### Step 1: Point Your Hostinger Domain to EC2

#### Option A: Use Subdomain (Recommended)
```
# In Hostinger DNS settings, add:
Type: A
Name: api (or setu, backend, etc.)
Value: 13.233.96.134
TTL: 300 (or default)
```

**Result**: `api.yourdomain.com` → `13.233.96.134`

#### Option B: Use Root Domain
```
# In Hostinger DNS settings, add:
Type: A
Name: @ (or leave empty)
Value: 13.233.96.134
TTL: 300 (or default)
```

**Result**: `yourdomain.com` → `13.233.96.134`

### Step 2: Add Domain to Cloudflare

1. **Go to Cloudflare**: https://cloudflare.com
2. **Create Free Account**: Sign up for free plan
3. **Add Your Domain**: Enter your Hostinger domain
4. **Choose Plan**: Select "Free" plan
5. **Update Nameservers**: Cloudflare will provide new nameservers

### Step 3: Update Hostinger Nameservers

**In Hostinger Control Panel:**
1. Go to "Domains" → Your Domain → "Nameservers"
2. Change from "Hostinger Nameservers" to "Custom Nameservers"
3. Add Cloudflare nameservers (provided by Cloudflare):
   ```
   Nameserver 1: [Cloudflare NS1]
   Nameserver 2: [Cloudflare NS2]
   ```

### Step 4: Configure Cloudflare DNS

**In Cloudflare Dashboard:**
1. Go to "DNS" → "Records"
2. Add your A record:
   ```
   Type: A
   Name: api (or @ for root domain)
   IPv4 address: 13.233.96.134
   Proxy status: Proxied (Orange cloud)
   ```

### Step 5: Enable SSL

**In Cloudflare Dashboard:**
1. Go to "SSL/TLS" → "Overview"
2. Set SSL/TLS encryption mode to: **"Flexible"**
3. Enable "Always Use HTTPS" (optional but recommended)

## 🔗 Result URLs

After setup, you'll have:
```
✅ HTTPS API: https://api.yourdomain.com
✅ HTTPS Health: https://api.yourdomain.com/health
✅ HTTPS Callback: https://api.yourdomain.com/api/consents/callback
✅ HTTPS Webhook: https://api.yourdomain.com/api/webhooks/setu
```

## 🎯 Setu Dashboard Configuration

**Update these URLs in Setu dashboard:**
```
Redirect URL: https://api.yourdomain.com/api/consents/callback
Webhook URL: https://api.yourdomain.com/api/webhooks/setu
```

## 🧪 Testing Your Setup

### Test Script
```bash
# Update test-https.js with your domain
node test-https.js
```

### Manual Testing
```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Test callback endpoint
curl https://api.yourdomain.com/api/consents/callback?consentId=test&status=ACTIVE

# Test SSL certificate
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com
```

## 🔄 Alternative: Let's Encrypt (If You Prefer)

If you want to use Let's Encrypt instead:

### Step 1: Point Domain to EC2
```
# In Hostinger DNS settings:
Type: A
Name: api
Value: 13.233.96.134
```

### Step 2: Run SSL Setup Script
```bash
# Update setup-ssl.sh with your domain
# Change this line:
DOMAIN="api.yourdomain.com"  # Your actual domain

# Run the script
./setup-ssl.sh
```

### Step 3: Test
```bash
curl https://api.yourdomain.com/health
```

## 📋 Comparison: Cloudflare vs Let's Encrypt

| Feature | Cloudflare | Let's Encrypt |
|---------|------------|---------------|
| **Setup Time** | 5 minutes | 15-30 minutes |
| **Server Changes** | None | Requires Nginx setup |
| **SSL Certificate** | Free | Free |
| **DDoS Protection** | ✅ Included | ❌ None |
| **CDN** | ✅ Included | ❌ None |
| **DNS Management** | ✅ Included | ❌ Use Hostinger |
| **Maintenance** | Automatic | Manual renewal |
| **Downtime** | Zero | Minimal |

## 🎯 Recommendation: Use Cloudflare

**For your Hostinger + EC2 setup, Cloudflare is the clear winner because:**

1. ✅ **Easier setup** (no server configuration)
2. ✅ **Better security** (DDoS protection)
3. ✅ **Better performance** (CDN)
4. ✅ **No maintenance** (automatic SSL renewal)
5. ✅ **Works perfectly** with Hostinger domains

## 🚀 Quick Start Commands

### Cloudflare Setup (Recommended)
```bash
# 1. Point domain to EC2 in Hostinger DNS
# 2. Add domain to Cloudflare
# 3. Update nameservers in Hostinger
# 4. Configure DNS in Cloudflare
# 5. Enable SSL (Flexible mode)
# 6. Test:
curl https://api.yourdomain.com/health
```

### Let's Encrypt Setup (Alternative)
```bash
# 1. Point domain to EC2 in Hostinger DNS
# 2. Update setup-ssl.sh with your domain
# 3. Run:
./setup-ssl.sh
# 4. Test:
curl https://api.yourdomain.com/health
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Domain Not Resolving
```bash
# Check DNS propagation
nslookup api.yourdomain.com
dig api.yourdomain.com

# Wait up to 24 hours for DNS propagation
```

#### 2. SSL Not Working
```bash
# For Cloudflare: Check SSL/TLS setting is "Flexible"
# For Let's Encrypt: Check certificate installation
openssl s_client -connect api.yourdomain.com:443
```

#### 3. Backend Not Accessible
```bash
# Check EC2 security group allows HTTPS (443)
# Check if backend is running
ssh -i your-key.pem ec2-user@13.233.96.134
pm2 status
```

## 📞 Support

### Cloudflare Support
- **Documentation**: https://developers.cloudflare.com/
- **SSL Guide**: https://support.cloudflare.com/hc/en-us/articles/200170416-What-do-the-SSL-options-mean-

### Hostinger Support
- **DNS Management**: https://support.hostinger.com/en/articles/1583290-how-to-manage-dns-records
- **Nameserver Changes**: https://support.hostinger.com/en/articles/1583291-how-to-change-nameservers

## 🎉 Expected Outcome

After implementing Cloudflare:
- ✅ **HTTPS URLs** that Setu accepts
- ✅ **DDoS protection** for your API
- ✅ **CDN** for faster loading
- ✅ **Automatic SSL renewal**
- ✅ **Professional setup** with minimal effort

**Your Setu Account Aggregator integration will be fully functional with HTTPS!** 🔒✨
