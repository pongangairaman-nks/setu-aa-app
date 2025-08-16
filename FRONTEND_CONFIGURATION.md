# 📱 Frontend Configuration Guide

## 🎯 **Overview**
This guide explains the configuration changes needed to connect your React Native/Expo mobile app to the production backend deployed on AWS EC2.

## 🔧 **Configuration Changes Made**

### **1. Environment Configuration (`src/config/environment.ts`)**

#### **Before (Development)**
```typescript
API_BASE_URL: 'http://localhost:5000/api'
```

#### **After (Production)**
```typescript
// Environment-specific configurations
const DEV_CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  ENABLE_LOGGING: true,
  API_TIMEOUT: 30000,
};

const PROD_CONFIG = {
  API_BASE_URL: 'http://13.233.96.134:5000/api',
  ENABLE_LOGGING: false,
  API_TIMEOUT: 15000,
};
```

### **2. API Client Updates (`src/services/api/apiClient.ts`)**

#### **Enhanced Features**
- ✅ **Environment-aware logging** (only in development)
- ✅ **Better error handling** with specific error messages
- ✅ **Health check method** for connection testing
- ✅ **User-Agent header** for request identification
- ✅ **Automatic auth token handling**

#### **Error Handling**
```typescript
// Specific error cases handled
if (error.response?.status === 401) {
  console.error('🔒 Unauthorized access - token may be expired');
} else if (error.response?.status === 500) {
  console.error('🔧 Server error - please try again later');
} else if (error.code === 'ECONNABORTED') {
  console.error('⏰ Request timeout - please check your connection');
} else if (error.code === 'NETWORK_ERROR') {
  console.error('🌐 Network error - please check your internet connection');
}
```

### **3. Configuration Test Component (`src/components/common/ConfigTest.tsx`)**

#### **Features**
- ✅ **Backend connection test**
- ✅ **Setu configuration test**
- ✅ **Webhook endpoint test**
- ✅ **Visual status indicators**
- ✅ **One-click test runner**

## 🌐 **Production URLs**

### **Backend API**
```
Base URL: http://13.233.96.134:5000
API Endpoint: http://13.233.96.134:5000/api
Health Check: http://13.233.96.134:5000/health
```

### **Setu Webhook**
```
Webhook URL: http://13.233.96.134:5000/api/webhooks/setu
```

## 🔄 **Environment Switching**

### **Development Mode**
```bash
# Uses localhost backend
NODE_ENV=development
API_BASE_URL=http://localhost:5000/api
ENABLE_LOGGING=true
API_TIMEOUT=30000
```

### **Production Mode**
```bash
# Uses production backend
NODE_ENV=production
API_BASE_URL=http://13.233.96.134:5000/api
ENABLE_LOGGING=false
API_TIMEOUT=15000
```

## 🧪 **Testing Your Configuration**

### **1. Add ConfigTest to Your App**
```typescript
import { ConfigTest } from './src/components/common/ConfigTest';

// Add to your screen or modal
<ConfigTest 
  onComplete={(success) => {
    if (success) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed');
    }
  }}
/>
```

### **2. Manual Testing**
```typescript
import { apiClient } from './src/services/api/apiClient';

// Test backend connection
const isHealthy = await apiClient.healthCheck();
console.log('Backend healthy:', isHealthy);

// Test Setu configuration
const setuConfig = await apiClient.get('/test-setu');
console.log('Setu config:', setuConfig);
```

## 📱 **Mobile App Build Configuration**

### **Expo Configuration**
```json
{
  "expo": {
    "name": "Setu AA Mobile App",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "extra": {
      "apiBaseUrl": "http://13.233.96.134:5000/api"
    }
  }
}
```

### **Environment Variables**
```bash
# .env file (optional)
REACT_APP_API_BASE_URL=http://13.233.96.134:5000/api
REACT_APP_SETU_BASE_URL=https://fiu-uat.setu.co
REACT_APP_SETU_CLIENT_ID=your-setu-client-id
REACT_APP_SETU_PRODUCT_ID=your-setu-product-id
```

## 🔒 **Security Considerations**

### **HTTPS in Production**
For production apps, consider:
1. **SSL Certificate**: Add HTTPS to your EC2 instance
2. **Domain Name**: Use a custom domain instead of IP
3. **Certificate Pinning**: Implement SSL certificate pinning

### **Current Setup**
- ✅ **HTTP**: Working for development and testing
- ⚠️ **HTTPS**: Recommended for production apps

## 🚀 **Deployment Checklist**

### **Before Building**
- [ ] Test backend connection
- [ ] Verify Setu configuration
- [ ] Test webhook endpoints
- [ ] Check environment variables

### **After Building**
- [ ] Test on physical device
- [ ] Verify network connectivity
- [ ] Test all API endpoints
- [ ] Monitor error logs

## 📊 **Monitoring & Debugging**

### **Development Logs**
```typescript
// Enable detailed logging in development
if (ENV.IS_DEVELOPMENT && ENV.ENABLE_LOGGING) {
  console.log(`🌐 API Request: ${method} ${url}`);
  console.log(`✅ API Response: ${status} ${url}`);
}
```

### **Error Tracking**
```typescript
// Enhanced error logging
console.error('❌ API Error:', {
  status: error.response?.status,
  url: error.config?.url,
  message: error.response?.data?.error?.message || error.message,
});
```

## 🔄 **Rollback Plan**

### **If Production Issues Occur**
1. **Switch to Development Backend**
   ```typescript
   API_BASE_URL: 'http://localhost:5000/api'
   ```

2. **Use Environment Variables**
   ```bash
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   ```

3. **Redeploy with Local Backend**
   ```bash
   npm run build
   ```

## 📞 **Support & Troubleshooting**

### **Common Issues**
1. **Connection Timeout**: Check EC2 security group
2. **CORS Errors**: Verify backend CORS configuration
3. **Auth Errors**: Check JWT token configuration
4. **Network Errors**: Verify internet connectivity

### **Debug Commands**
```bash
# Test backend from mobile device
curl http://13.233.96.134:5000/health

# Test from development machine
curl http://13.233.96.134:5000/api/test-setu
```

---

**🎯 Your frontend is now configured to connect to the production backend! Test thoroughly before releasing to users.**
