# Deployment Guide

## Overview

This guide covers deploying the Setu AA Mobile App to production environments.

## Prerequisites

- Node.js 18+ installed
- MongoDB database
- Setu production API credentials
- Cloud hosting platform (AWS, Google Cloud, etc.)
- SSL certificates
- Domain name

## Frontend Deployment

### 1. Build Configuration

Update the environment variables for production:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain.com
EXPO_PUBLIC_SETU_CLIENT_ID=your-production-client-id
EXPO_PUBLIC_SETU_CLIENT_SECRET=your-production-client-secret
EXPO_PUBLIC_SETU_ENVIRONMENT=production
EXPO_PUBLIC_WEBHOOK_URL=https://your-backend-domain.com/api/webhook
```

### 2. Build for Production

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### 3. Submit to App Stores

```bash
# Submit to iOS App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

### 4. EAS Update (Optional)

For over-the-air updates:

```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"

# Configure auto-updates in app.json
{
  "expo": {
    "updates": {
      "enabled": true,
      "fallbackToCacheTimeout": 0
    }
  }
}
```

## Backend Deployment

### 1. Environment Setup

Create production environment file:

```bash
# Copy example file
cp backend/env.example backend/.env.production

# Update with production values
nano backend/.env.production
```

### 2. Database Setup

#### MongoDB Atlas (Recommended)

1. Create MongoDB Atlas account
2. Create a new cluster
3. Configure network access
4. Create database user
5. Get connection string

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/setu-aa-app
```

#### Self-hosted MongoDB

```bash
# Install MongoDB
sudo apt-get install mongodb

# Configure MongoDB
sudo nano /etc/mongod.conf

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Server Deployment

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Build the application
cd backend
npm run build

# Start with PM2
pm2 start dist/server.js --name "setu-aa-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

Build and run:

```bash
# Build image
docker build -t setu-aa-backend .

# Run container
docker run -d \
  --name setu-aa-backend \
  -p 3000:3000 \
  --env-file .env.production \
  setu-aa-backend
```

#### Using Cloud Platforms

##### AWS EC2

1. Launch EC2 instance
2. Install Node.js and PM2
3. Clone repository
4. Configure environment
5. Start application

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone and setup
git clone <repository-url>
cd setu-aa-backend
npm install
npm run build
pm2 start dist/server.js
```

##### Google Cloud Run

1. Create `Dockerfile`
2. Build and push to Container Registry
3. Deploy to Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/setu-aa-backend
gcloud run deploy setu-aa-backend \
  --image gcr.io/PROJECT_ID/setu-aa-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 4. Reverse Proxy Setup

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Certificate

#### Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### 1. Application Monitoring

#### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs setu-aa-backend

# Restart application
pm2 restart setu-aa-backend
```

#### Winston Logging

Configure logging in the application:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### 2. Health Checks

```bash
# Test health endpoint
curl https://your-domain.com/health

# Monitor with external service
# Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use secure secret management
- Rotate secrets regularly

### 2. Database Security

- Use strong passwords
- Enable authentication
- Configure firewall rules
- Regular backups

### 3. API Security

- Rate limiting
- Input validation
- CORS configuration
- JWT token management

### 4. Server Security

- Keep systems updated
- Configure firewall
- Use SSH keys
- Regular security audits

## Backup Strategy

### 1. Database Backups

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/setu-aa-app" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backup/$DATE"
tar -czf "/backup/$DATE.tar.gz" "/backup/$DATE"
rm -rf "/backup/$DATE"
```

### 2. Application Backups

- Version control for code
- Configuration backups
- Log file rotation

## Performance Optimization

### 1. Database Optimization

- Index optimization
- Query optimization
- Connection pooling

### 2. Application Optimization

- Caching strategies
- Compression
- CDN for static assets

### 3. Monitoring

- Performance metrics
- Error tracking
- User analytics

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check port usage
   sudo netstat -tulpn | grep :3000
   ```

2. **Memory issues**
   ```bash
   # Monitor memory usage
   free -h
   top
   ```

3. **Database connection issues**
   ```bash
   # Test database connection
   mongo "mongodb://localhost:27017/setu-aa-app"
   ```

### Rollback Strategy

1. Keep previous versions
2. Database migration scripts
3. Blue-green deployment
4. Feature flags

## Support

For deployment issues:
- Check server logs
- Monitor system resources
- Review security configurations
- Contact infrastructure team 