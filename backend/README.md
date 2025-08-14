# Setu Account Aggregator Backend

A complete backend API for the Setu Account Aggregator mobile app, built with Node.js, Express, and MongoDB.

## Features

- **Consent Management**: Create, manage, and track user consents for financial data access
- **Account Aggregation**: Fetch and store bank account information from multiple FIPs
- **Transaction History**: Retrieve and manage transaction data across accounts
- **Webhook Handling**: Process Setu webhook notifications for real-time updates
- **Automatic Data Cleanup**: Automatically delete data after 6 months as per regulations
- **User Authentication**: Secure JWT-based authentication system
- **Rate Limiting**: Protect API endpoints from abuse
- **Comprehensive Logging**: Winston-based logging with file and console output
- **Data Validation**: Express-validator for request validation
- **Security**: Helmet, CORS, and other security middleware

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Setu Account Aggregator API credentials

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd setu-aa-mobile-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/setu-aa-app
   
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
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas
   # Update MONGODB_URI in .env
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
All endpoints except webhooks require authentication via Bearer token in the Authorization header.

### Consent Management

#### Create Consent
```http
POST /api/consents/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "fipId": "string",
  "fipName": "string",
  "dataLife": 180,
  "permissions": ["ACCOUNT", "TRANSACTIONS"],
  "fetchType": "PERIODIC",
  "frequency": {
    "unit": "MONTH",
    "value": 1
  }
}
```

#### Get User Consents
```http
GET /api/consents
Authorization: Bearer <token>
```

#### Get Consent by ID
```http
GET /api/consents/:consentId
Authorization: Bearer <token>
```

#### Update Consent Status
```http
PATCH /api/consents/:consentId/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "ACTIVE"
}
```

#### Revoke Consent
```http
DELETE /api/consents/:consentId
Authorization: Bearer <token>
```

### Account Management

#### Fetch Accounts
```http
POST /api/accounts/fetch
Content-Type: application/json
Authorization: Bearer <token>

{
  "consentId": "string",
  "dataRange": {
    "from": "2023-01-01T00:00:00Z",
    "to": "2023-12-31T23:59:59Z"
  }
}
```

#### Get User Accounts
```http
GET /api/accounts
Authorization: Bearer <token>
```

#### Get Account by ID
```http
GET /api/accounts/:accountId
Authorization: Bearer <token>
```

#### Get Account Summary
```http
GET /api/accounts/summary
Authorization: Bearer <token>
```

#### Refresh Accounts
```http
POST /api/accounts/refresh
Authorization: Bearer <token>
```

### Transaction Management

#### Fetch Transactions
```http
POST /api/transactions/fetch
Content-Type: application/json
Authorization: Bearer <token>

{
  "accountId": "string",
  "consentId": "string",
  "dataRange": {
    "from": "2023-01-01T00:00:00Z",
    "to": "2023-12-31T23:59:59Z"
  }
}
```

#### Get User Transactions
```http
GET /api/transactions?page=1&limit=50&fromDate=2023-01-01&toDate=2023-12-31
Authorization: Bearer <token>
```

#### Get Transaction by ID
```http
GET /api/transactions/:transactionId
Authorization: Bearer <token>
```

#### Get Transaction Summary
```http
GET /api/transactions/summary?fromDate=2023-01-01&toDate=2023-12-31
Authorization: Bearer <token>
```

#### Get Transactions by Category
```http
GET /api/transactions/category?fromDate=2023-01-01&toDate=2023-12-31
Authorization: Bearer <token>
```

#### Refresh Transactions
```http
POST /api/transactions/refresh
Content-Type: application/json
Authorization: Bearer <token>

{
  "days": 30
}
```

### Webhooks

#### Consent Webhook
```http
POST /api/webhooks/consent
Content-Type: application/json

{
  "type": "CONSENT",
  "data": {
    "consentId": "string",
    "status": "ACTIVE",
    "timestamp": "2023-01-01T00:00:00Z"
  },
  "signature": "webhook-signature"
}
```

#### Data Webhook
```http
POST /api/webhooks/data
Content-Type: application/json

{
  "type": "DATA",
  "data": {
    "consentId": "string",
    "accountId": "string",
    "dataType": "ACCOUNT",
    "timestamp": "2023-01-01T00:00:00Z"
  },
  "signature": "webhook-signature"
}
```

## Data Models

### User
- Basic user information
- Authentication details
- Preferences and settings
- Account status and activity tracking

### Consent
- Consent details and permissions
- FIP information
- Status tracking
- Automatic expiry handling

### Account
- Bank account information
- Balance and status
- FIP and consent references
- Last fetch timestamps

### Transaction
- Transaction details
- Amount and type
- Category and merchant information
- Account and consent references

## Data Retention

The system automatically deletes data after 6 months (180 days) as per regulatory requirements:

- **TTL Indexes**: MongoDB TTL indexes automatically delete documents
- **Scheduled Cleanup**: Daily cleanup job removes expired data
- **Manual Cleanup**: API endpoints for manual data cleanup

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protect against API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured CORS for security
- **Helmet**: Security headers middleware
- **Webhook Signature Verification**: Secure webhook processing

## Logging

The application uses Winston for logging:

- **Console Logging**: Colored output for development
- **File Logging**: Separate files for errors and combined logs
- **HTTP Logging**: Morgan integration for request logging
- **Structured Logging**: JSON format for production

## Error Handling

- **Consistent Error Format**: Standardized error responses
- **Validation Errors**: Detailed validation error messages
- **Global Error Handler**: Catch-all error handling
- **Logging**: All errors are logged with context

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

### Environment Variables
Ensure all required environment variables are set in production.

### Database
- Use MongoDB Atlas or a production MongoDB instance
- Set up proper indexes for performance
- Configure backup and monitoring

### Security
- Use strong JWT secrets
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Use environment-specific configurations

### Monitoring
- Set up application monitoring
- Configure log aggregation
- Set up health checks
- Monitor database performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting
6. Submit a pull request

## License

MIT License - see LICENSE file for details. 