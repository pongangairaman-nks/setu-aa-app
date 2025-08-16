# 🔧 Re-enable Cloudflare Proxy and Test HTTPS

## 🎯 Current Status
- ✅ **Direct HTTP**: Working perfectly (api.hedgrpay.com:5000)
- ✅ **Backend**: Running correctly
- ✅ **DNS**: Resolving to EC2 IP
- ❌ **HTTPS**: Need to re-enable Cloudflare proxy

## 🔧 Steps to Re-enable Cloudflare Proxy

### Step 1: Re-enable Proxy in Cloudflare

**In Cloudflare Dashboard:**
1. Go to **"DNS"** section
2. Find the A record for `api.hedgrpay.com`
3. **Click the gray cloud icon** to make it **orange** again (Proxied)
4. This will re-enable Cloudflare proxy

### Step 2: Wait for Propagation

**Wait 5-10 minutes** for the changes to propagate globally.

### Step 3: Test HTTPS

After waiting, test the HTTPS endpoints:

```bash
# Test HTTPS health
curl https://api.hedgrpay.com/health

# Test HTTPS callback
curl "https://api.hedgrpay.com/api/consents/callback?consentId=test&status=ACTIVE"

# Run full test
node test-https-hedgrpay.js
```

## 🎯 Expected Results

After re-enabling proxy:
```
✅ HTTPS Health: https://api.hedgrpay.com/health (200 OK)
✅ HTTPS Callback: https://api.hedgrpay.com/api/consents/callback (302 Redirect)
✅ HTTPS Webhook: https://api.hedgrpay.com/api/webhooks/setu (200 OK)
```

## 🔗 Setu Dashboard URLs

Once HTTPS is working, update Setu dashboard with:
```
Redirect URL: https://api.hedgrpay.com/api/consents/callback
Webhook URL: https://api.hedgrpay.com/api/webhooks/setu
```

## 💡 Why This Should Work Now

- ✅ **Backend confirmed working** (direct HTTP test passed)
- ✅ **DNS resolution working** (points to EC2 IP)
- ✅ **Security group configured** (allows port 5000)
- ✅ **SSL/TLS set to Flexible** (Cloudflare → HTTP backend)
- ✅ **Proxy configuration correct** (A record points to EC2)

## 🎉 Final Result

Your setup will be complete:
- ✅ **Cloudflare SSL**: Working with proxy
- ✅ **Domain**: Pointing to EC2
- ✅ **Backend**: Running on port 5000
- ✅ **Security Group**: Allowing traffic
- ✅ **Setu Integration**: Ready to use

**Re-enable the Cloudflare proxy and test HTTPS!** 🔧
