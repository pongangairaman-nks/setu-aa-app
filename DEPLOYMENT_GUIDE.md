# Setu AA Backend Deployment Guide

## 🎉 Deployment Status: SUCCESSFUL

Your Setu AA Backend has been successfully deployed to AWS EC2!

### 📍 Server Information
- **EC2 Instance**: `ec2-13-233-96-134.ap-south-1.compute.amazonaws.com`
- **Public IP**: `13.233.96.134`
- **Region**: `ap-south-1`
- **Application Port**: `5000`

### 🔗 API Endpoints
- **Health Check**: `http://13.233.96.134:5000/health`
- **Setu Webhook URL**: `http://13.233.96.134:5000/api/webhooks/setu`
- **API Base URL**: `http://13.233.96.134:5000/api`

### ⚠️ IMPORTANT: Security Group Configuration

**You need to configure your AWS Security Group to allow inbound traffic on port 5000:**

1. Go to AWS Console → EC2 → Security Groups
2. Find the security group attached to your EC2 instance
3. Add a new inbound rule:
   - **Type**: Custom TCP
   - **Port**: 5000
   - **Source**: 0.0.0.0/0 (or your specific IP range for security)
   - **Description**: Setu Backend API

### 🔧 Application Management

#### SSH Access
```bash
ssh -i "/Users/pongangairaman/Desktop/workspace/poc/setu-app-app.pem" ec2-user@ec2-13-233-96-134.ap-south-1.compute.amazonaws.com
```

#### PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs setu-backend

# Restart application
pm2 restart setu-backend

# Stop application
pm2 stop setu-backend

# Start application
pm2 start setu-backend
```

### 📝 Configuration Steps

#### 1. Update Environment Variables
SSH into your EC2 instance and update the `.env` file:

```bash
cd /home/ec2-user/setu-aa-backend
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (if using)
MONGODB_URI=your-mongodb-connection-string

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Setu API Configuration
SETU_BASE_URL=https://fiu-uat.setu.co
SETU_CLIENT_ID=your-setu-client-id
SETU_CLIENT_SECRET=your-setu-client-secret
SETU_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----
SETU_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nYour public key here\n-----END PUBLIC KEY-----
SETU_AA_HANDLE=your-aa-handle
SETU_WEBHOOK_SECRET=your-webhook-secret

# Frontend URLs (for CORS)
FRONTEND_URL=your-frontend-url
EXPO_URL=your-expo-url
```

#### 2. Restart Application After Configuration
```bash
pm2 restart setu-backend
```

### 🧪 Testing Your Deployment

#### 1. Health Check
```bash
curl http://13.233.96.134:5000/health
```

#### 2. Test Setu Configuration
```bash
curl http://13.233.96.134:5000/test-setu
```

#### 3. Test Webhook Endpoint
```bash
curl -X POST http://13.233.96.134:5000/api/webhooks/setu \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### 📊 Available API Endpoints

#### Consent Management
- `GET /api/consents` - List all consents
- `POST /api/consents` - Create new consent
- `GET /api/consents/:id` - Get consent by ID
- `PUT /api/consents/:id` - Update consent
- `DELETE /api/consents/:id` - Delete consent

#### Account Management
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get account by ID
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

#### Transaction Management
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

#### Webhooks
- `POST /api/webhooks/setu` - Setu webhook endpoint

### 🔄 Updating Your Mobile App

Update your mobile app configuration to use the new backend URL:

```typescript
// In your mobile app's environment configuration
export const API_BASE_URL = 'http://13.233.96.134:5000/api';
export const WEBHOOK_URL = 'http://13.233.96.134:5000/api/webhooks/setu';
```

### 🚨 Troubleshooting

#### Application Not Starting
```bash
# Check PM2 logs
pm2 logs setu-backend

# Check if port is in use
sudo netstat -tlnp | grep :5000

# Restart PM2
pm2 restart setu-backend
```

#### Port Not Accessible
1. Check Security Group configuration
2. Verify firewall settings: `sudo firewall-cmd --list-all`
3. Test locally: `curl http://localhost:5000/health`

#### Environment Variables Issues
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are loaded
pm2 env setu-backend
```

### 📈 Monitoring

#### PM2 Monitoring
```bash
# Monitor CPU and Memory usage
pm2 monit

# View detailed status
pm2 show setu-backend
```

#### Log Files
- **Application Logs**: `/home/ec2-user/setu-aa-backend/logs/`
- **PM2 Logs**: `pm2 logs setu-backend`
- **System Logs**: `sudo journalctl -u pm2-ec2-user`

### 🔒 Security Recommendations

1. **Use HTTPS**: Set up SSL/TLS certificate for production
2. **Restrict Security Group**: Limit inbound access to specific IP ranges
3. **Regular Updates**: Keep Node.js and dependencies updated
4. **Environment Variables**: Never commit sensitive data to version control
5. **Monitoring**: Set up CloudWatch for monitoring and alerting

### 📞 Support

If you encounter any issues:
1. Check the logs: `pm2 logs setu-backend`
2. Verify configuration: `pm2 env setu-backend`
3. Test endpoints locally on the server
4. Check AWS Security Group and firewall settings

---

**🎯 Your Setu AA Backend is now live and ready to handle webhook notifications from Setu!**
