# 🔧 Final Solution: AWS Security Group Update

## 🎯 Current Status
- ✅ **Nginx**: Installed and configured (port 80 → 5000)
- ✅ **Backend**: Running on port 5000
- ✅ **Cloudflare**: DNS and SSL configured
- ❌ **AWS Security Group**: Missing port 80 rule

## 🔧 Final Step: Update AWS Security Group

### Step 1: Add Port 80 to AWS Security Group

**In AWS Console:**
1. Go to **EC2** → **Security Groups**
2. Find your security group (the one attached to your EC2 instance)
3. Click on the security group
4. Go to **"Inbound rules"** tab
5. Click **"Edit inbound rules"**
6. Click **"Add rule"**
7. Configure:
   ```
   Type: HTTP
   Protocol: TCP
   Port range: 80
   Source: 0.0.0.0/0
   Description: HTTP for Cloudflare
   ```
8. Click **"Save rules"**

### Step 2: Test the Setup

After adding port 80:

```bash
# Test HTTP (direct to EC2)
curl http://13.233.96.134:80/health

# Test HTTPS (through Cloudflare)
curl https://hedgrpay.com/health

# Test callback
curl "https://hedgrpay.com/api/consents/callback?consentId=test&status=ACTIVE"
```

## 🎯 Expected Results

After adding port 80 to security group:
```
✅ HTTP: http://13.233.96.134:80/health (200 OK)
✅ HTTPS: https://hedgrpay.com/health (200 OK)
✅ Callback: https://hedgrpay.com/api/consents/callback (302 Redirect)
```

## 🔗 Setu Dashboard URLs

Once working, update Setu dashboard with:
```
Redirect URL: https://hedgrpay.com/api/consents/callback
Webhook URL: https://hedgrpay.com/api/webhooks/setu
```

## 💡 How This Works

1. **Cloudflare** receives HTTPS request
2. **Cloudflare** connects to your EC2 on port 80 (HTTP)
3. **Nginx** on port 80 proxies to your backend on port 5000
4. **Your backend** responds
5. **Nginx** forwards response back to Cloudflare
6. **Cloudflare** sends HTTPS response to user

## 🎉 Final Result

Your setup will be complete:
- ✅ **Cloudflare SSL**: Working with proxy
- ✅ **Nginx**: Reverse proxy (80 → 5000)
- ✅ **Backend**: Running on port 5000
- ✅ **Security Group**: Allowing ports 22, 80, 5000
- ✅ **Setu Integration**: Ready to use

**Add port 80 to your AWS security group and everything will work!** 🔧
