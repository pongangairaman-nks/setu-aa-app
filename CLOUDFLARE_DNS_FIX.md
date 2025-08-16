# 🔧 Cloudflare DNS Fix for hedgrpay.com

## 🎯 Current Issue
- ❌ **DNS Resolution**: `api.hedgrpay.com` → Cloudflare IPs (not your EC2)
- ❌ **HTTPS**: 522 error (Cloudflare can't reach your backend)
- ✅ **HTTP**: Working directly to EC2

## 🔧 Solution: Fix Cloudflare DNS Record

### Step 1: Check Cloudflare DNS Records

**In Cloudflare Dashboard:**
1. Go to your `hedgrpay.com` domain
2. Click **"DNS"** in the left sidebar
3. Look for the A record for `api.hedgrpay.com`

### Step 2: Verify the A Record

**The A record should be:**
```
Type: A
Name: api
Content: 13.233.96.134
Proxy status: Proxied (Orange cloud)
```

### Step 3: Fix if Incorrect

**If the A record is missing or wrong:**
1. Click **"+ Add record"**
2. Configure:
   ```
   Type: A
   Name: api
   IPv4 address: 13.233.96.134
   Proxy status: Proxied (Orange cloud)
   ```
3. Click **"Save"**

### Step 4: Check Proxy Status

**Important**: Make sure the proxy status shows:
- ✅ **Orange cloud** = Proxied (traffic goes through Cloudflare)
- ❌ **Gray cloud** = DNS only (traffic bypasses Cloudflare)

## 🧪 Test After Fix

### Wait for DNS Propagation
- **Wait 5-10 minutes** for changes to propagate
- DNS changes can take time to spread globally

### Test HTTPS
```bash
curl https://api.hedgrpay.com/health
```

### Test Callback
```bash
curl "https://api.hedgrpay.com/api/consents/callback?consentId=test&status=ACTIVE"
```

## 🎯 Expected Results

After fixing DNS:
```
✅ DNS: api.hedgrpay.com → 13.233.96.134 (via Cloudflare)
✅ HTTPS: https://api.hedgrpay.com/health (200 OK)
✅ Callback: https://api.hedgrpay.com/api/consents/callback (302 Redirect)
```

## 🔍 Current DNS Status

**What we see now:**
```
api.hedgrpay.com → 104.21.22.145 (Cloudflare IP)
api.hedgrpay.com → 172.67.205.82 (Cloudflare IP)
```

**What it should be:**
```
api.hedgrpay.com → 13.233.96.134 (Your EC2 IP, via Cloudflare)
```

## 💡 Why This Happens

- **Cloudflare proxies traffic** to your backend
- **DNS should point to Cloudflare** (which is correct)
- **But Cloudflare needs to know** your backend IP (13.233.96.134)
- **The A record in Cloudflare** must point to your EC2 IP

## 🎉 After Fix

Your setup will be complete:
- ✅ **DNS**: Properly configured
- ✅ **SSL/TLS**: Flexible mode
- ✅ **Backend**: Running on EC2
- ✅ **Security Group**: Allowing traffic
- ✅ **Setu Integration**: Ready to use

**Check the DNS record in Cloudflare and make sure it points to 13.233.96.134!** 🔧
