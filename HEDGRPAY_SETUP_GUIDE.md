# 🔒 SSL Setup for hedgrpay.com + EC2 Instance

## 🎯 Your Setup
- **Domain**: hedgrpay.com (Hostinger)
- **Server**: AWS EC2 (13.233.96.134:5000)
- **Goal**: HTTPS URLs for Setu dashboard

## 🚀 Recommended: Cloudflare Setup (5 minutes)

### Step 1: Point hedgrpay.com to EC2 (2 minutes)

**In Hostinger Control Panel:**
1. Go to "Domains" → "hedgrpay.com" → "DNS Zone Editor"
2. Add A record:
   ```
   Type: A
   Name: api
   Value: 13.233.96.134
   TTL: 300
   ```
3. **Result**: `api.hedgrpay.com` → `13.233.96.134`

### Step 2: Add hedgrpay.com to Cloudflare (2 minutes)

1. **Go to Cloudflare**: https://cloudflare.com
2. **Create Free Account**: Sign up for free plan
3. **Add Domain**: Enter `hedgrpay.com`
4. **Choose Plan**: Select "Free" plan
5. **Note the nameservers** provided by Cloudflare (you'll need these)

### Step 3: Update Hostinger Nameservers (1 minute)

**In Hostinger Control Panel:**
1. Go to "Domains" → "hedgrpay.com" → "Nameservers"
2. Change from "Hostinger Nameservers" to "Custom Nameservers"
3. Add Cloudflare nameservers (from Step 2):
   ```
   Nameserver 1: [Cloudflare NS1]
   Nameserver 2: [Cloudflare NS2]
   ```

### Step 4: Configure Cloudflare DNS (1 minute)

**In Cloudflare Dashboard:**
1. Go to "DNS" → "Records"
2. Add A record:
   ```
   Type: A
   Name: api
   IPv4 address: 13.233.96.134
   Proxy status: Proxied (Orange cloud)
   ```

### Step 5: Enable SSL (1 minute)

**In Cloudflare Dashboard:**
1. Go to "SSL/TLS" → "Overview"
2. Set SSL/TLS encryption mode to: **"Flexible"**
3. Enable "Always Use HTTPS" (optional but recommended)

## 🔗 Result URLs

After setup, you'll have:
```
✅ HTTPS API: https://api.hedgrpay.com
✅ HTTPS Health: https://api.hedgrpay.com/health
✅ HTTPS Callback: https://api.hedgrpay.com/api/consents/callback
✅ HTTPS Webhook: https://api.hedgrpay.com/api/webhooks/setu
```

## 🎯 Setu Dashboard Configuration

**Update these URLs in Setu dashboard:**
```
Redirect URL: https://api.hedgrpay.com/api/consents/callback
Webhook URL: https://api.hedgrpay.com/api/webhooks/setu
```

## 🧪 Testing Your Setup

### Quick Test
```bash
# Test health endpoint
curl https://api.hedgrpay.com/health

# Test callback endpoint
curl https://api.hedgrpay.com/api/consents/callback?consentId=test&status=ACTIVE
```

### Full Test Script
```bash
# Run the test script
node test-https-hedgrpay.js
```

## ⏰ Timeline

- **DNS Propagation**: 5 minutes to 24 hours
- **Cloudflare Setup**: 5 minutes
- **SSL Activation**: Immediate
- **Total Time**: 10-30 minutes

## 🔧 Troubleshooting

### Domain Not Working?
```bash
# Check DNS
nslookup api.hedgrpay.com
dig api.hedgrpay.com

# Should show: 13.233.96.134
```

### SSL Not Working?
- Check Cloudflare SSL/TLS is set to "Flexible"
- Ensure proxy is enabled (orange cloud)
- Wait for DNS propagation

### Backend Not Accessible?
```bash
# Check if backend is running
ssh -i your-key.pem ec2-user@13.233.96.134
pm2 status
```

## 🎉 Benefits After Setup

- ✅ **Setu accepts your URLs**
- ✅ **Free SSL certificate**
- ✅ **DDoS protection**
- ✅ **CDN for faster loading**
- ✅ **Automatic HTTPS redirect**
- ✅ **Professional setup**

## 📞 Support

### Cloudflare Support
- **SSL Guide**: https://support.cloudflare.com/hc/en-us/articles/200170416-What-do-the-SSL-options-mean-
- **DNS Setup**: https://support.cloudflare.com/hc/en-us/articles/200168246-Adding-a-new-domain-to-Cloudflare

### Hostinger Support
- **DNS Management**: https://support.hostinger.com/en/articles/1583290-how-to-manage-dns-records
- **Nameserver Changes**: https://support.hostinger.com/en/articles/1583291-how-to-change-nameservers

## 🚀 Alternative: Let's Encrypt

If you prefer Let's Encrypt:
```bash
# 1. Point domain to EC2 in Hostinger
# 2. Update setup-ssl.sh with your domain
# 3. Run:
./setup-ssl.sh
```

**But Cloudflare is recommended for your setup!**

---

**🎯 Your Setu Account Aggregator will be fully functional with HTTPS in under 30 minutes!** 🔒✨
