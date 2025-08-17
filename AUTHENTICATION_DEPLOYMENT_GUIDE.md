# 🔐 Authentication System Deployment Guide

## Overview
This guide covers the complete implementation of a dual authentication system:
1. **User Authentication**: Regular JWT-based auth for app users
2. **Setu Token Management**: Automatic token fetching/refreshing in backend

## ✅ What's Been Implemented

### Frontend Components
- ✅ `src/services/auth/userAuthService.ts` - User authentication service
- ✅ `src/screens/LoginScreen/LoginScreen.tsx` - Login/Register screen
- ✅ `src/screens/LoginScreen/LoginScreen.styles.ts` - Login screen styles
- ✅ `src/services/api/apiClient.ts` - Updated to use user auth
- ✅ `src/services/api/setuApi.ts` - Updated to use backend proxy
- ✅ `src/navigation/AppNavigator.tsx` - Added login screen
- ✅ `src/services/auth/simpleTokenService.ts` - Updated endpoint

### Backend Components
- ✅ `backend/src/services/setuTokenManager.js` - Setu token management
- ✅ `backend/src/routes/userAuthRoutes.js` - User authentication routes
- ✅ `backend/src/routes/setuRoutes.js` - Updated to use token manager
- ✅ `backend/src/models/User.js` - User model
- ✅ `backend/src/middleware/authMiddleware.js` - Authentication middleware
- ✅ `backend/server.js` - Updated route mounting

## 🚀 Deployment Steps

### 0. Prerequisites
- ✅ Backend code is ready with authentication system
- ✅ `deploy-backend.sh` script is available
- ✅ EC2 instance is running and accessible
- ✅ PEM file is available for SSH access

### 1. Backend Deployment

#### Step 1.1: Update Environment Variables
The deployment script will create a `.env` file from `env.example`. You need to update the actual `.env` file on your EC2 instance with these values:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Setu API Configuration - Sandbox Environment
SETU_BASE_URL=https://fiu-sandbox.setu.co
SETU_CLIENT_ID=b615a43a-e779-4d95-9ddb-768c7666d96b
SETU_CLIENT_SECRET=eY6l9Wbdm488SdS3lbeznFwDLtsbVvQM
SETU_PRODUCT_ID=e02807a8-2588-4306-83d2-5eb1e615abda
```

#### Step 1.2: Deploy Using the Script
```bash
# Run the deployment script
./deploy-backend.sh
```

#### Step 1.3: Update Environment Variables on EC2
After deployment, SSH into your EC2 instance and update the `.env` file:

```bash
# SSH into EC2
ssh -i "/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem" ec2-user@ec2-13-233-96-134.ap-south-1.compute.amazonaws.com

# Navigate to backend directory
cd /home/ec2-user/setu-aa-backend

# Edit the .env file
nano .env

# Update the JWT_SECRET and other values as shown above
# Save and exit (Ctrl+X, Y, Enter)

# Restart the application
pm2 restart setu-backend

# Check the status
pm2 status
pm2 logs setu-backend
```

#### Step 1.4: What the Deployment Script Does
The `deploy-backend.sh` script automatically:

1. **Creates deployment package**: Excludes `node_modules`, `logs`, and `.env`
2. **Uploads to EC2**: Uses SCP to transfer files
3. **Installs dependencies**: Runs `npm install --production`
4. **Sets up PM2**: Installs PM2 if not present and starts the application
5. **Creates .env**: Copies from `env.example` if `.env` doesn't exist
6. **Starts application**: Runs with PM2 for process management

**Note**: The script will create a `.env` file from `env.example`, but you need to manually update it with your actual configuration values.

### 2. Frontend Deployment

#### Step 2.1: Test the Application
1. Start your frontend development server
2. Navigate to the login screen
3. Create a new account or login with existing credentials
4. Test consent creation

## 🧪 Testing the System

### Test User Authentication
```bash
node test-user-auth.js
```

### Test Complete Flow
1. **Register User**: Create account with email/password
2. **Login User**: Authenticate and get JWT token
3. **Create Consent**: Backend automatically fetches Setu token
4. **View WebView**: User approves consent in Setu interface

### Test After Deployment
After deploying to EC2, test the authentication system:

```bash
# Test backend health
curl https://hedgrpay.com/health

# Test user registration
curl -X POST https://hedgrpay.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test user login
curl -X POST https://hedgrpay.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint (use token from login response)
curl -X GET https://hedgrpay.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🔧 How It Works

### User Authentication Flow
```
1. User enters email/password
2. Frontend calls /api/auth/login
3. Backend validates credentials
4. Backend returns JWT token
5. Frontend stores token securely
6. All subsequent API calls include JWT token
```

### Setu Token Management Flow
```
1. Frontend makes API call to backend
2. Backend validates user JWT token
3. Backend checks if Setu token is valid
4. If not valid, backend automatically fetches new Setu token
5. Backend makes authenticated call to Setu API
6. Backend returns result to frontend
```

## 📁 Key Files and Their Purposes

### Frontend Files
- `userAuthService.ts` - Handles user login, register, logout
- `LoginScreen.tsx` - UI for user authentication
- `apiClient.ts` - Adds JWT token to all API requests
- `setuApi.ts` - Routes Setu API calls through backend

### Backend Files
- `setuTokenManager.js` - Manages Setu token lifecycle
- `userAuthRoutes.js` - User authentication endpoints
- `User.js` - User database model
- `authMiddleware.js` - Protects routes with JWT validation

## 🔒 Security Features

### User Authentication
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Account locking after failed attempts
- ✅ Rate limiting on login attempts
- ✅ Secure token storage

### Setu Integration
- ✅ Automatic token refresh
- ✅ Token caching and reuse
- ✅ Error handling and retry logic
- ✅ Sandbox environment support

## 🐛 Troubleshooting

### Common Issues

#### 1. "Route not found" Error
- Ensure backend server is running on EC2
- Check that routes are properly mounted in `server.js`
- Verify environment variables are set in `.env` file on EC2
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs setu-backend`

#### 2. Deployment Script Issues
- Ensure PEM file path is correct in `deploy-backend.sh`
- Check EC2 instance is accessible: `ping ec2-13-233-96-134.ap-south-1.compute.amazonaws.com`
- Verify SSH access: `ssh -i "path/to/pem" ec2-user@ec2-13-233-96-134.ap-south-1.compute.amazonaws.com`
- Check disk space on EC2: `df -h`

#### 2. "Token issuer not allowed" Error
- Ensure Setu credentials are correct
- Verify sandbox environment is being used
- Check that product ID is valid

#### 3. CORS Errors
- Backend handles CORS automatically
- Frontend routes all Setu calls through backend
- No direct frontend-to-Setu API calls

#### 4. Authentication Errors
- Check JWT_SECRET is set in backend
- Verify user credentials are correct
- Ensure database connection is working

### Debug Commands
```bash
# Test backend health
curl https://hedgrpay.com/health

# Test user registration
curl -X POST https://hedgrpay.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test user login
curl -X POST https://hedgrpay.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Monitoring Commands
```bash
# SSH into EC2
ssh -i "/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem" ec2-user@ec2-13-233-96-134.ap-south-1.compute.amazonaws.com

# Check PM2 status
pm2 status

# View application logs
pm2 logs setu-backend

# Monitor system resources
htop
free -h
df -h

# Check if port 5000 is listening
netstat -tulpn | grep :5000

# Test local health endpoint
curl http://localhost:5000/health
```

## 🎯 Next Steps

### Immediate Actions
1. ✅ Deploy backend changes
2. ✅ Test user registration/login
3. ✅ Test consent creation flow
4. ✅ Verify Setu token management

### Future Enhancements
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add role-based access control
- [ ] Implement session management
- [ ] Add audit logging

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review backend logs for errors
3. Test individual components using the provided test scripts
4. Verify all environment variables are correctly set

---

**🎉 Congratulations!** Your authentication system is now ready for production use.
