# 🔧 Cloudflare 522 Error Troubleshooting

## 🎯 Current Status
- ✅ **DNS Record**: Correctly configured in Cloudflare
- ✅ **SSL/TLS**: Set to Flexible mode
- ✅ **Backend**: Running on EC2 (port 5000)
- ✅ **Security Group**: Allowing traffic
- ❌ **HTTPS**: 522 error (Cloudflare can't reach backend)

## 🔧 Troubleshooting Steps

### Step 1: Temporarily Disable Cloudflare Proxy

**In Cloudflare Dashboard:**
1. Go to **"DNS"** section
2. Find the A record for `api.hedgrpay.com`
3. Click the **orange cloud icon** to make it **gray** (DNS only)
4. This will bypass Cloudflare temporarily

### Step 2: Test Direct Connection

After disabling proxy:
```bash
# Test direct connection (should work)
curl http://api.hedgrpay.com/health
```

### Step 3: Re-enable Proxy

If direct connection works:
1. Click the **gray cloud icon** to make it **orange** again (Proxied)
2. Wait 5-10 minutes
3. Test HTTPS again

### Step 4: Check Cloudflare Status

**In Cloudflare Dashboard:**
1. Go to **"Overview"** section
2. Check if there are any warnings or issues
3. Verify domain status is "Active"

## 🎯 Alternative Solutions

### Option 1: Use Different Subdomain
Try using a different subdomain:
```
setu.hedgrpay.com → 13.233.96.134
```

### Option 2: Use Root Domain
Point the root domain to your EC2:
```
hedgrpay.com → 13.233.96.134
```

### Option 3: Check Backend Configuration
The backend might need specific headers or configuration for Cloudflare.

## 🧪 Test Commands

### Test Direct HTTP
```bash
curl http://13.233.96.134:5000/health
```

### Test DNS Resolution
```bash
nslookup api.hedgrpay.com
```

### Test with Host Header
```bash
curl -H "Host: api.hedgrpay.com" http://13.233.96.134:5000/health
```

## 💡 Common Causes of 522 Error

1. **Backend not responding** (not your case)
2. **Firewall blocking Cloudflare** (possible)
3. **Backend rejecting Cloudflare connections** (possible)
4. **DNS propagation issues** (less likely)
5. **Cloudflare configuration issues** (possible)

## 🎉 Expected Results

After troubleshooting:
```
✅ HTTPS: https://api.hedgrpay.com/health (200 OK)
✅ Callback: https://api.hedgrpay.com/api/consents/callback (302 Redirect)
✅ Webhook: https://api.hedgrpay.com/api/webhooks/setu (200 OK)
```

## 🔗 Setu Dashboard URLs

Once working:
```
Redirect URL: https://api.hedgrpay.com/api/consents/callback
Webhook URL: https://api.hedgrpay.com/api/webhooks/setu
```

**Try temporarily disabling the Cloudflare proxy to isolate the issue!** 🔧
