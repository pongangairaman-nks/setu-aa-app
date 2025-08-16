# ⚡ Quick Setup: Hostinger Domain + EC2 + Cloudflare

## 🎯 Your Current Setup
- ✅ **Domain**: Hostinger (you have this)
- ✅ **Server**: AWS EC2 (13.233.96.134:5000)
- ✅ **Backend**: Running and working
- ❌ **SSL**: Need HTTPS for Setu

## 🚀 Recommended: Cloudflare (5-minute setup)

### Why Cloudflare for Hostinger?
- ✅ **Works with Hostinger DNS**
- ✅ **Free SSL certificate**
- ✅ **DDoS protection**
- ✅ **No server changes needed**
- ✅ **Automatic HTTPS redirect**

## 📋 Quick Setup Checklist

### Step 1: Point Domain to EC2 (2 minutes)
**In Hostinger Control Panel:**
1. Go to "Domains" → Your Domain → "DNS Zone Editor"
2. Add A record:
   ```
   Type: A
   Name: api (or setu, backend)
   Value: 13.233.96.134
   TTL: 300
   ```
3. **Result**: `api.yourdomain.com` → `13.233.96.134`

### Step 2: Add to Cloudflare (2 minutes)
1. Go to https://cloudflare.com
2. Create free account
3. Add your domain
4. Choose "Free" plan
5. **Note the nameservers** provided by Cloudflare

### Step 3: Update Nameservers (1 minute)
**In Hostinger Control Panel:**
1. Go to "Domains" → Your Domain → "Nameservers"
2. Change to "Custom Nameservers"
3. Add Cloudflare nameservers (from Step 2)

### Step 4: Configure Cloudflare DNS (1 minute)
**In Cloudflare Dashboard:**
1. Go to "DNS" → "Records"
2. Add A record:
   ```
   Type: A
   Name: api
   IPv4: 13.233.96.134
   Proxy: Proxied (Orange cloud)
   ```

### Step 5: Enable SSL (1 minute)
**In Cloudflare Dashboard:**
1. Go to "SSL/TLS" → "Overview"
2. Set to: **"Flexible"**
3. Enable "Always Use HTTPS" (optional)

## 🔗 Result URLs

After setup:
```
✅ HTTPS API: https://api.yourdomain.com
✅ HTTPS Health: https://api.yourdomain.com/health
✅ HTTPS Callback: https://api.yourdomain.com/api/consents/callback
✅ HTTPS Webhook: https://api.yourdomain.com/api/webhooks/setu
```

## 🎯 Setu Dashboard Update

**Update these URLs in Setu dashboard:**
```
Redirect URL: https://api.yourdomain.com/api/consents/callback
Webhook URL: https://api.yourdomain.com/api/webhooks/setu
```

## 🧪 Testing

### Quick Test
```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Test callback endpoint
curl https://api.yourdomain.com/api/consents/callback?consentId=test&status=ACTIVE
```

### Full Test Script
```bash
# Update test-https-hostinger.js with your domain
# Uncomment the test line and run:
node test-https-hostinger.js
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
nslookup api.yourdomain.com
dig api.yourdomain.com

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

## 📞 Need Help?

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
