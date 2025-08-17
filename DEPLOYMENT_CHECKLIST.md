# 🚀 Authentication System Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Ready
- [ ] All authentication files are implemented
- [ ] Backend routes are properly configured
- [ ] Frontend services are updated
- [ ] Environment variables are documented

### ✅ Infrastructure Ready
- [ ] EC2 instance is running
- [ ] PEM file is accessible
- [ ] Security groups allow port 5000
- [ ] Domain (hedgrpay.com) is configured

## Deployment Steps

### 1. Deploy Backend
```bash
# Run deployment script
./deploy-backend.sh
```

### 2. Configure Environment Variables
```bash
# SSH into EC2
ssh -i "/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem" ec2-user@ec2-13-233-96-134.ap-south-1.compute.amazonaws.com

# Navigate to backend
cd /home/ec2-user/setu-aa-backend

# Edit .env file
nano .env
```

**Update these values in .env:**
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Setu API Configuration
SETU_BASE_URL=https://fiu-sandbox.setu.co
SETU_CLIENT_ID=b615a43a-e779-4d95-9ddb-768c7666d96b
SETU_CLIENT_SECRET=eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM
SETU_PRODUCT_ID=e02807a8-2588-4306-83d2-5eb1e615abda
```

### 3. Restart Application
```bash
# Restart with new configuration
pm2 restart setu-backend

# Check status
pm2 status
pm2 logs setu-backend
```

## Testing Checklist

### ✅ Backend Health
- [ ] `curl https://hedgrpay.com/health` returns success
- [ ] PM2 shows application as "online"

### ✅ User Authentication
- [ ] User registration works: `curl -X POST https://hedgrpay.com/api/auth/register`
- [ ] User login works: `curl -X POST https://hedgrpay.com/api/auth/login`
- [ ] Protected endpoints work with JWT token

### ✅ Setu Integration
- [ ] Consent creation works
- [ ] Backend automatically fetches Setu tokens
- [ ] WebView opens for consent approval

### ✅ Frontend Integration
- [ ] Login screen appears first
- [ ] User can register/login
- [ ] Consent creation works after login
- [ ] All API calls include JWT token

## Troubleshooting

### If Routes Not Found
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs setu-backend

# Check if server is listening
netstat -tulpn | grep :5000
```

### If Authentication Fails
```bash
# Check JWT_SECRET in .env
cat .env | grep JWT_SECRET

# Check logs for auth errors
pm2 logs setu-backend | grep -i auth
```

### If Setu Integration Fails
```bash
# Check Setu credentials in .env
cat .env | grep SETU

# Check Setu token logs
pm2 logs setu-backend | grep -i setu
```

## Success Criteria

### ✅ All Systems Working
- [ ] User can register and login
- [ ] JWT tokens are generated and validated
- [ ] Setu tokens are automatically managed
- [ ] Consent creation works end-to-end
- [ ] Frontend and backend communicate properly

### ✅ Security Verified
- [ ] Passwords are hashed
- [ ] JWT tokens are secure
- [ ] Rate limiting is active
- [ ] CORS is properly configured

## Post-Deployment

### ✅ Monitoring Setup
- [ ] PM2 monitoring is active
- [ ] Logs are being generated
- [ ] Health endpoint is responding

### ✅ Documentation Updated
- [ ] Deployment guide is complete
- [ ] Troubleshooting steps are documented
- [ ] API endpoints are tested

---

**🎉 Deployment Complete!** Your authentication system is now live and ready for production use.
