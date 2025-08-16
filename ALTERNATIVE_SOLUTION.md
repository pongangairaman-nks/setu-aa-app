# 🔧 Alternative Solution for Cloudflare 522 Error

## 🎯 Current Issue
- ✅ **Backend**: Working perfectly on port 5000
- ✅ **DNS**: Correctly configured
- ✅ **Security Group**: Allowing traffic
- ❌ **Cloudflare**: 522 error (can't reach backend on port 5000)

## 🔧 Solution Options

### Option 1: Use Different Subdomain (Recommended)

**In Cloudflare DNS, add a new record:**
```
Type: A
Name: setu
Content: 13.233.96.134
Proxy: Proxied (Orange cloud)
```

**Then use these URLs:**
```
Redirect URL: https://setu.hedgrpay.com/api/consents/callback
Webhook URL: https://setu.hedgrpay.com/api/webhooks/setu
```

### Option 2: Use Root Domain

**In Cloudflare DNS, add:**
```
Type: A
Name: @ (or leave empty)
Content: 13.233.96.134
Proxy: Proxied (Orange cloud)
```

**Then use these URLs:**
```
Redirect URL: https://hedgrpay.com/api/consents/callback
Webhook URL: https://hedgrpay.com/api/webhooks/setu
```

### Option 3: Set Up Reverse Proxy

**Install Nginx on EC2:**
```bash
sudo yum install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Configure Nginx to proxy port 80 to 5000:**
```nginx
server {
    listen 80;
    server_name api.hedgrpay.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🧪 Test the Solutions

### Test Option 1 (setu subdomain)
```bash
# After adding the DNS record
curl https://setu.hedgrpay.com/health
```

### Test Option 2 (root domain)
```bash
# After adding the DNS record
curl https://hedgrpay.com/health
```

### Test Option 3 (Nginx proxy)
```bash
# After setting up Nginx
curl https://api.hedgrpay.com/health
```

## 🎯 Recommended Approach

**Try Option 1 first** (different subdomain):
1. Add `setu.hedgrpay.com` → `13.233.96.134` in Cloudflare DNS
2. Test: `curl https://setu.hedgrpay.com/health`
3. If it works, use these URLs in Setu dashboard

## 🔗 Setu Dashboard URLs

**For Option 1:**
```
Redirect URL: https://setu.hedgrpay.com/api/consents/callback
Webhook URL: https://setu.hedgrpay.com/api/webhooks/setu
```

**For Option 2:**
```
Redirect URL: https://hedgrpay.com/api/consents/callback
Webhook URL: https://hedgrpay.com/api/webhooks/setu
```

## 💡 Why This Might Work

- **Different subdomain**: Sometimes Cloudflare handles different subdomains differently
- **Root domain**: Might have different routing rules
- **Nginx proxy**: Handles the port 80 → 5000 mapping

## 🎉 Expected Result

After implementing any option:
```
✅ HTTPS Health: Working
✅ HTTPS Callback: 302 Redirect to mobile app
✅ HTTPS Webhook: Working
✅ Setu Integration: Ready to use
```

**Try Option 1 (setu subdomain) first - it's the simplest!** 🔧
