# 🔧 Cloudflare SSL Fix for hedgrpay.com

## 🎯 Current Status
- ✅ **HTTP endpoints**: Working perfectly
- ✅ **Backend**: Running on EC2
- ✅ **Security Group**: Correctly configured
- ❌ **HTTPS endpoints**: 522 error (Cloudflare can't reach backend)

## 🔧 Solution: Fix Cloudflare SSL Configuration

### Step 1: Check Cloudflare SSL/TLS Settings

**In Cloudflare Dashboard:**
1. Go to your `hedgrpay.com` domain
2. Click **"SSL/TLS"** in the left sidebar
3. Go to **"Overview"** tab
4. Check the **"Encryption mode"**

### Step 2: Set SSL/TLS to "Flexible"

**Current Issue**: Cloudflare is trying to connect to your backend via HTTPS, but your backend only supports HTTP.

**Fix**: Change SSL/TLS mode to **"Flexible"**

1. In SSL/TLS Overview, click **"Edit"** next to Encryption mode
2. Select **"Flexible"**
3. Click **"Save"**

### Step 3: Verify the Change

After setting to "Flexible":
- **Client → Cloudflare**: HTTPS (encrypted)
- **Cloudflare → Your Backend**: HTTP (unencrypted)
- **Result**: HTTPS works for users, backend stays simple

## 🧪 Test After Fix

### Test HTTPS Health
```bash
curl https://api.hedgrpay.com/health
```

### Test HTTPS Callback
```bash
curl "https://api.hedgrpay.com/api/consents/callback?consentId=test&status=ACTIVE"
```

### Run Full Test
```bash
node test-https-hedgrpay.js
```

## 🎯 Expected Results

After fixing SSL/TLS mode:
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

## 💡 Why This Happens

- **Your backend**: Only supports HTTP (port 5000)
- **Cloudflare**: Tries to connect via HTTPS by default
- **Solution**: "Flexible" mode tells Cloudflare to use HTTP for backend communication

## 🎉 After Fix

Your setup will be complete:
- ✅ **Cloudflare SSL**: Working with Flexible mode
- ✅ **Domain**: Pointing to EC2
- ✅ **Backend**: Running on HTTP
- ✅ **Security Group**: Allowing traffic
- ✅ **Setu Integration**: Ready to use

**The SSL/TLS mode change is the final fix!** 🔧
