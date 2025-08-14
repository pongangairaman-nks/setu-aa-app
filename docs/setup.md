# Setu AA Mobile App - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Setu Account Aggregator API credentials
- MongoDB (for backend)

## Frontend Setup

### 1. Install Dependencies

```bash
cd setu-aa-mobile-app
npm install
# or
yarn install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_SETU_CLIENT_ID=your-setu-client-id
EXPO_PUBLIC_SETU_CLIENT_SECRET=your-setu-client-secret
EXPO_PUBLIC_SETU_ENVIRONMENT=sandbox
EXPO_PUBLIC_WEBHOOK_URL=http://localhost:3000/api/webhook
```

### 3. Install Expo Go

Download Expo Go from:
- iOS: App Store
- Android: Google Play Store

### 4. Start Development Server

```bash
npx expo start
```

### 5. Run on Device

- Scan the QR code with Expo Go
- Or press 'i' for iOS simulator
- Or press 'a' for Android emulator

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Update the `.env` file with your credentials.

### 3. Database Setup

Install and start MongoDB:

```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 4. Start Backend Server

```bash
npm run dev
```

## Setu API Configuration

### 1. Get API Credentials

1. Sign up at [Setu Account Aggregator](https://setu.co)
2. Create a new application
3. Get your Client ID and Client Secret
4. Configure webhook URLs

### 2. Configure Permissions

Set up the required permissions in your Setu dashboard:
- Account information
- Transaction history
- Profile data

### 3. Test Integration

Use the Setu sandbox environment for testing:
- Test consent creation
- Test data fetching
- Verify webhook handling

## Project Structure

```
setu-aa-mobile-app/
├── App.js                          # Main app entry point
├── src/
│   ├── components/                 # Reusable components
│   ├── screens/                    # App screens
│   ├── navigation/                 # Navigation setup
│   ├── services/                   # API and external services
│   ├── hooks/                      # Custom React hooks
│   ├── store/                      # Redux state management
│   ├── types/                      # TypeScript type definitions
│   ├── utils/                      # Utility functions
│   └── config/                     # Configuration files
├── backend/                        # Node.js backend
└── docs/                           # Documentation
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Dependencies issues**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Backend connection issues**
   - Check if backend server is running
   - Verify API base URL in environment
   - Check CORS configuration

4. **Setu API issues**
   - Verify API credentials
   - Check environment (sandbox/production)
   - Review API documentation

## Next Steps

1. Configure your Setu API credentials
2. Set up webhook endpoints
3. Test the complete flow
4. Deploy to production

## Support

For issues and questions:
- Check the [Setu Documentation](https://docs.setu.co)
- Review the [Expo Documentation](https://docs.expo.dev)
- Create an issue in the project repository 