# API Documentation

## Overview

This document describes the API endpoints for the Setu Account Aggregator Mobile App backend.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://your-production-domain.com`

## Authentication

All API endpoints (except webhooks) require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Endpoints

### Consent Management

#### Create Consent Request

```http
POST /api/consent
```

**Request Body:**
```json
{
  "fipId": "string",
  "dataLife": 30,
  "permissions": ["ACCOUNT", "TRANSACTIONS"],
  "fetchType": "PERIODIC",
  "frequency": {
    "unit": "MONTH",
    "value": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consentId": "string",
    "consentUrl": "string",
    "status": "PENDING",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "expiresAt": "2023-02-01T00:00:00.000Z"
  }
}
```

#### Get Consent Status

```http
GET /api/consent/:consentId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consentId": "string",
    "status": "ACTIVE",
    "fipName": "string",
    "dataLife": 30,
    "permissions": ["ACCOUNT", "TRANSACTIONS"],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "expiresAt": "2023-02-01T00:00:00.000Z"
  }
}
```

#### Revoke Consent

```http
POST /api/consent/:consentId/revoke
```

**Response:**
```json
{
  "success": true,
  "message": "Consent revoked successfully"
}
```

### Account Management

#### Fetch Accounts

```http
POST /api/accounts/fetch
```

**Request Body:**
```json
{
  "consentId": "string",
  "dataRange": {
    "from": "2023-01-01T00:00:00.000Z",
    "to": "2023-01-31T23:59:59.999Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "accountId": "string",
        "accountName": "string",
        "accountNumber": "string",
        "bankName": "string",
        "accountType": "SAVINGS",
        "balance": 10000.00,
        "status": "ACTIVE"
      }
    ]
  }
}
```

#### Get Account Details

```http
GET /api/accounts/:accountId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountId": "string",
    "accountName": "string",
    "accountNumber": "string",
    "bankName": "string",
    "accountType": "SAVINGS",
    "balance": 10000.00,
    "status": "ACTIVE",
    "lastUpdated": "2023-01-01T00:00:00.000Z"
  }
}
```

### Transaction Management

#### Fetch Transactions

```http
POST /api/transactions/fetch
```

**Request Body:**
```json
{
  "accountId": "string",
  "dataRange": {
    "from": "2023-01-01T00:00:00.000Z",
    "to": "2023-01-31T23:59:59.999Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "string",
        "accountId": "string",
        "description": "string",
        "amount": 1000.00,
        "transactionType": "DEBIT",
        "transactionDate": "2023-01-15T00:00:00.000Z",
        "balance": 9000.00,
        "status": "SUCCESS"
      }
    ]
  }
}
```

### Webhook Endpoints

#### Consent Webhook

```http
POST /api/webhook/consent
```

**Request Body:**
```json
{
  "type": "CONSENT",
  "data": {
    "consentId": "string",
    "status": "ACTIVE",
    "timestamp": "2023-01-01T00:00:00.000Z"
  },
  "signature": "string"
}
```

#### Data Webhook

```http
POST /api/webhook/data
```

**Request Body:**
```json
{
  "type": "DATA",
  "data": {
    "consentId": "string",
    "accountId": "string",
    "dataType": "ACCOUNT",
    "timestamp": "2023-01-01T00:00:00.000Z"
  },
  "signature": "string"
}
```

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** Rate limit information is included in response headers

## Webhook Security

Webhook endpoints verify requests using HMAC signatures:

1. Calculate HMAC-SHA256 of the request body using your webhook secret
2. Compare with the `signature` header
3. Reject requests with invalid signatures

## Testing

### Using cURL

```bash
# Create consent
curl -X POST http://localhost:3000/api/consent \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fipId": "test-fip",
    "dataLife": 30,
    "permissions": ["ACCOUNT"]
  }'

# Fetch accounts
curl -X POST http://localhost:3000/api/accounts/fetch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "consentId": "consent-id",
    "dataRange": {
      "from": "2023-01-01T00:00:00.000Z",
      "to": "2023-01-31T23:59:59.999Z"
    }
  }'
```

### Using Postman

1. Import the API collection
2. Set the base URL
3. Configure authentication headers
4. Test each endpoint

## SDK Integration

The mobile app uses the following SDKs:

- **Setu SDK:** For Account Aggregator integration
- **Expo SDK:** For React Native functionality
- **Redux Toolkit:** For state management

## Support

For API-related issues:
- Check the request/response format
- Verify authentication headers
- Review error messages
- Contact the development team 