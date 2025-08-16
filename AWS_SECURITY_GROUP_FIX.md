# 🔧 AWS Security Group Fix for hedgrpay.com

## 🎯 Problem
Your backend is running but not accessible from the internet because the AWS security group doesn't allow inbound traffic on port 5000.

## 🔧 Solution: Update AWS Security Group

### Step 1: Go to AWS Console
1. Log into AWS Console
2. Go to **EC2** service
3. Click on **Security Groups** in the left sidebar

### Step 2: Find Your Security Group
1. Look for the security group attached to your EC2 instance
2. It should be the one with your EC2 instance (13.233.96.134)

### Step 3: Add Inbound Rule
1. Click on your security group
2. Go to **Inbound rules** tab
3. Click **Edit inbound rules**
4. Click **Add rule**
5. Configure the rule:
   ```
   Type: Custom TCP
   Protocol: TCP
   Port range: 5000
   Source: 0.0.0.0/0 (or 0.0.0.0/0 for any IP)
   Description: Backend API
   ```
6. Click **Save rules**

### Step 4: Verify the Rule
You should now see:
```
Type: Custom TCP
Protocol: TCP
Port: 5000
Source: 0.0.0.0/0
```

## 🧪 Test After Fix

### Test HTTP (Direct to EC2)
```bash
curl http://13.233.96.134:5000/health
```

### Test HTTPS (Through Cloudflare)
```bash
curl https://api.hedgrpay.com/health
```

### Run Full Test
```bash
node test-https-hedgrpay.js
```

## 🎯 Expected Results

After fixing the security group:
```
✅ HTTP: http://13.233.96.134:5000/health (200 OK)
✅ HTTPS: https://api.hedgrpay.com/health (200 OK)
✅ Callback: https://api.hedgrpay.com/api/consents/callback (302 Redirect)
✅ Webhook: https://api.hedgrpay.com/api/webhooks/setu (200 OK)
```

## 🔗 Setu Dashboard URLs

Once working, update Setu dashboard with:
```
Redirect URL: https://api.hedgrpay.com/api/consents/callback
Webhook URL: https://api.hedgrpay.com/api/webhooks/setu
```

## 💡 Alternative: Quick Test

If you can't access AWS console right now, you can test the security group by:

```bash
# Test if port 5000 is open
telnet 13.233.96.134 5000

# Or use nmap
nmap -p 5000 13.233.96.134
```

## 🎉 After Fix

Your setup will be complete:
- ✅ **Cloudflare SSL**: Working
- ✅ **Domain**: Pointing to EC2
- ✅ **Backend**: Running
- ✅ **Security Group**: Allowing traffic
- ✅ **Setu Integration**: Ready to use

**The security group fix is the final step to make everything work!** 🔧
