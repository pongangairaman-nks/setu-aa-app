# Comprehensive FIU Application Guide for India's Account Aggregator Framework

## Table of Contents
1. [Financial Data Types & Access](#1-financial-data-types--access)
2. [Compliance & Regulatory Requirements](#2-compliance--regulatory-requirements)
3. [Technical Implementation](#3-technical-implementation)
4. [Best Practices](#4-best-practices)
5. [Implementation Checklist](#5-implementation-checklist)
6. [References](#6-references)

---

## 1. Financial Data Types & Access

### 1.1 Supported Financial Information Types (fiTypes)

The Account Aggregator framework supports the following financial data types:

#### Banking Products
- **DEPOSIT**: Savings, Current, Fixed Deposit, Recurring Deposit accounts
- **FIXED_DEPOSITS**: Fixed deposit accounts with maturity details
- **RECURRING_DEPOSITS**: Recurring deposit accounts

#### Investment Products
- **MUTUAL_FUNDS**: Mutual fund holdings, NAV, units, folio details
- **EQUITIES**: Direct equity holdings, demat account details
- **GOLD**: Sovereign Gold Bonds, digital gold, physical gold

#### Insurance Products
- **INSURANCE_POLICIES**: Life, health, motor, and other insurance policies

#### Retirement Products
- **EPF**: Employee Provident Fund accounts
- **PPF**: Public Provident Fund accounts
- **NPS**: National Pension System accounts

### 1.2 Data Access Modes

#### VIEW Mode
- **Purpose**: One-time data viewing
- **Retention**: No storage allowed
- **Use Case**: Quick balance checks, account verification

#### STORE Mode
- **Purpose**: Data storage and processing
- **Retention**: Up to 180 days (configurable)
- **Use Case**: Financial analysis, portfolio management

#### QUERY Mode
- **Purpose**: On-demand data access
- **Retention**: Limited storage (30 days)
- **Use Case**: Ad-hoc financial queries

#### STREAM Mode
- **Purpose**: Real-time data streaming
- **Retention**: Minimal storage (7 days)
- **Use Case**: Real-time monitoring, alerts

### 1.3 Transaction Data Granularity

#### Basic Transaction Data
```typescript
interface BasicTransaction {
  transactionId: string;
  amount: number;
  transactionType: 'CREDIT' | 'DEBIT';
  transactionDate: Date;
  description: string;
  balance: number;
}
```

#### Detailed Transaction Data
```typescript
interface DetailedTransaction extends BasicTransaction {
  category: string;
  merchantName: string;
  referenceNumber: string;
  currency: string;
  transactionMode: string;
  upiId: string;
  chequeNumber: string;
  narration: string;
  location: string;
  deviceId: string;
}
```

#### Enhanced Transaction Data
```typescript
interface EnhancedTransaction extends DetailedTransaction {
  merchantCategoryCode: string;
  merchantId: string;
  terminalId: string;
  authorizationCode: string;
  cardLastFourDigits: string;
  cardType: string;
  internationalTransaction: boolean;
  cashbackEarned: number;
  rewardPoints: number;
}
```

### 1.4 Account Level Data

#### Basic Account Data
```typescript
interface BasicAccount {
  accountId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: string;
  balance: number;
  status: string;
}
```

#### Detailed Account Data
```typescript
interface DetailedAccount extends BasicAccount {
  currency: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  maskedAccountNumber: string;
  lastTransactionDate: Date;
  averageBalance: number;
}
```

### 1.5 Profile and Summary Data

#### Basic Profile Data
```typescript
interface BasicProfile {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  panNumber: string;
}
```

#### Summary Data
```typescript
interface AccountSummary {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  averageBalance: number;
  accountTypes: string[];
  banks: string[];
}

interface TransactionSummary {
  totalTransactions: number;
  totalCredit: number;
  totalDebit: number;
  averageAmount: number;
  transactionCategories: string[];
  monthlyTrends: MonthlyTrend[];
}
```

---

## 2. Compliance & Regulatory Requirements

### 2.1 Data Retention Requirements

#### Mandatory Retention Periods
- **Consent Records**: 365 days (1 year)
- **Transaction Data**: 180 days (6 months)
- **Account Data**: 180 days (6 months)
- **Audit Logs**: 1095 days (3 years)
- **User Sessions**: 90 days (3 months)
- **Webhook Events**: 180 days (6 months)
- **Error Logs**: 365 days (1 year)
- **Compliance Reports**: 1825 days (5 years)

#### Automatic Deletion Triggers
- Consent expiry
- Data life expiry
- User account deletion
- Regulatory requirements

### 2.2 Consent Management Requirements

#### Granular Permissions
- Data types selection
- Time period specification
- Frequency control
- Purpose explanation
- FIP selection

#### Consent Expiry Handling
- Notification at 30, 7, and 1 days before expiry
- Auto-revocation after grace period
- Renewal reminders
- Immediate effect on revocation

#### Consent Validation
- Active status verification
- Expiry date checking
- Permission validation
- FIP availability check

### 2.3 Security Requirements

#### Data Encryption
```typescript
interface EncryptionConfig {
  atRest: {
    algorithm: 'AES-256-GCM';
    keyRotation: 90; // days
    keyManagement: 'AWS KMS';
  };
  inTransit: {
    protocol: 'TLS 1.3';
    minimumVersion: 'TLS 1.2';
    cipherSuites: string[];
  };
  apiKeys: {
    algorithm: 'RSA-2048';
    rotation: 365; // days
    storage: 'HARDWARE_SECURITY_MODULE';
  };
}
```

#### Authentication & Authorization
- Multi-factor authentication (MFA)
- Session timeout (1 hour)
- Maximum login attempts (5)
- Account lockout (30 minutes)
- Password policy enforcement

#### Access Controls
- Role-based access control (RBAC)
- Principle of least privilege
- Segregation of duties
- Regular access review

### 2.4 Audit Trail Requirements

#### Events to Log
```typescript
interface AuditEvents {
  userActions: [
    'login',
    'logout',
    'consent_creation',
    'consent_revocation',
    'data_access',
    'data_export',
    'profile_update'
  ];
  systemActions: [
    'data_fetch',
    'webhook_received',
    'consent_expiry',
    'data_deletion',
    'error_occurred',
    'security_event'
  ];
  adminActions: [
    'user_management',
    'system_configuration',
    'data_export',
    'compliance_report'
  ];
}
```

#### Log Format
```typescript
interface AuditLogEntry {
  timestamp: string; // ISO 8601
  userId: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  resource: string;
  result: string;
  details?: any;
}
```

### 2.5 RBI and ReBIT Compliance

#### RBI Requirements
- Data localization
- Audit requirements
- Reporting obligations
- KYC compliance
- Anti-money laundering (AML)

#### ReBIT Framework
- Technical specifications compliance
- API standards adherence
- Security guidelines
- Testing requirements

---

## 3. Technical Implementation

### 3.1 Database Schema Design

#### Enhanced Account Schema
```javascript
const enhancedAccountSchema = new mongoose.Schema({
  // Basic Account Information
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  consentId: { type: String, required: true, index: true },
  accountId: { type: String, required: true, index: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true, encrypted: true },
  bankName: { type: String, required: true },
  accountType: { type: String, enum: [...], required: true },
  fiType: { type: String, enum: [...], required: true },
  balance: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: [...], default: 'ACTIVE' },

  // Enhanced Account Details
  ifscCode: { type: String, encrypted: true },
  branchName: String,
  accountHolderName: { type: String, encrypted: true },
  maskedAccountNumber: String,
  interestRate: Number,
  minimumBalance: Number,
  overdraftLimit: Number,
  accountOpeningDate: Date,
  maturityDate: Date,
  kycStatus: { type: String, enum: [...], default: 'PENDING' },

  // Investment Specific Fields
  units: Number,
  nav: Number,
  currentValue: Number,
  investmentAmount: Number,
  schemeName: String,
  schemeCode: String,
  folioNumber: { type: String, encrypted: true },
  amcName: String,
  fundHouse: String,

  // Insurance Specific Fields
  policyNumber: { type: String, encrypted: true },
  policyType: String,
  insurerName: String,
  sumAssured: Number,
  premiumAmount: Number,
  premiumFrequency: String,
  nextDueDate: Date,

  // Equity Specific Fields
  dematAccountNumber: { type: String, encrypted: true },
  stockSymbol: String,
  quantity: Number,
  averagePrice: Number,
  currentPrice: Number,
  marketValue: Number,
  dpId: String,
  clientId: String,
  brokerName: String,

  // EPF/PPF Specific Fields
  epfAccountNumber: { type: String, encrypted: true },
  uanNumber: { type: String, encrypted: true },
  employerName: String,
  employeeContribution: Number,
  employerContribution: Number,
  interestEarned: Number,
  lastContributionDate: Date,

  // NPS Specific Fields
  pranNumber: { type: String, encrypted: true },
  totalContribution: Number,
  currentNav: Number,
  fundManager: String,
  schemeDetails: mongoose.Schema.Types.Mixed,

  // Gold Investment Fields
  goldType: String,
  purchasePrice: Number,
  purchaseDate: Date,
  issuerName: String,
  bondNumber: { type: String, encrypted: true },

  // Fixed Deposit Fields
  fdNumber: { type: String, encrypted: true },
  principalAmount: Number,
  maturityAmount: Number,
  autoRenewal: { type: Boolean, default: false },

  // Recurring Deposit Fields
  rdNumber: { type: String, encrypted: true },
  monthlyAmount: Number,
  totalContribution: Number,

  // Nominee Details
  nomineeDetails: {
    name: { type: String, encrypted: true },
    relationship: String,
    percentage: Number
  },

  // Joint Holder Details
  jointHolderDetails: [{
    name: { type: String, encrypted: true },
    relationship: String,
    percentage: Number
  }],

  // Account Features
  accountFeatures: [{
    feature: String,
    enabled: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
  }],

  // Compliance and Audit Fields
  lastFetched: { type: Date, default: Date.now, index: true },
  lastUpdated: { type: Date, default: Date.now },
  dataSource: { type: String, required: true },
  fipId: { type: String, required: true },
  fipName: { type: String, required: true },
  consentExpiryDate: { type: Date, required: true, index: true },
  dataLifeExpiryDate: { type: Date, required: true, index: true },

  // Security and Encryption
  encryptionVersion: { type: String, default: 'v1' },
  dataIntegrityHash: String,

  // TTL indexes for automatic deletion
  deleteAt: {
    type: Date,
    default: function() {
      const deleteDate = new Date();
      deleteDate.setDate(deleteDate.getDate() + 180); // 6 months
      return deleteDate;
    },
    index: { expireAfterSeconds: 0 }
  },

  // Consent expiry TTL
  consentExpiryDeleteAt: {
    type: Date,
    default: function() {
      return this.consentExpiryDate;
    },
    index: { expireAfterSeconds: 0 }
  },

  // Data life expiry TTL
  dataLifeExpiryDeleteAt: {
    type: Date,
    default: function() {
      return this.dataLifeExpiryDate;
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  collection: 'enhanced_accounts'
});
```

### 3.2 Enhanced Consent Management Service

#### Consent Creation with Validation
```javascript
async createConsent(consentData) {
  // Validate consent data
  const validationResult = this.validateConsentData(consentData);
  if (!validationResult.isValid) {
    throw new Error(`Consent validation failed: ${validationResult.errors.join(', ')}`);
  }

  // Check for existing active consents
  const existingConsent = await this.checkExistingConsent(consentData.userId, consentData.fipId);
  if (existingConsent) {
    return existingConsent;
  }

  // Create consent request with Setu
  const setuConsentData = this.prepareSetuConsentData(consentData);
  const setuResponse = await setuService.createConsentRequest(setuConsentData);

  // Create consent record in database
  const consent = new Consent({
    userId: consentData.userId,
    consentId: setuResponse.consentId,
    fipId: consentData.fipId,
    fipName: consentData.fipName,
    dataLife: consentData.dataLife || 180,
    permissions: consentData.permissions,
    fetchType: consentData.fetchType,
    frequency: consentData.frequency,
    consentUrl: setuResponse.consentUrl,
    expiresAt: new Date(Date.now() + (consentData.dataLife || 180) * 24 * 60 * 60 * 1000)
  });

  await consent.save();

  // Log audit trail
  await this.logAuditEvent('consent_creation', {
    userId: consentData.userId,
    consentId: setuResponse.consentId,
    fipId: consentData.fipId,
    permissions: consentData.permissions
  });

  // Send notification
  await this.sendConsentNotification('creation', consent);

  return {
    consentId: setuResponse.consentId,
    consentUrl: setuResponse.consentUrl,
    status: 'PENDING',
    expiresAt: consent.expiresAt,
    dataLife: consent.dataLife
  };
}
```

#### Consent Status Update Handling
```javascript
async handleConsentStatusUpdate(consentId, status, additionalData = {}) {
  const consent = await Consent.findOne({ consentId });
  if (!consent) {
    throw new Error(`Consent not found: ${consentId}`);
  }

  const previousStatus = consent.status;
  consent.status = status;
  consent.lastUpdated = new Date();

  // Handle specific status updates
  switch (status) {
    case 'ACTIVE':
      await this.handleConsentActivation(consent, additionalData);
      break;
    case 'EXPIRED':
      await this.handleConsentExpiry(consent);
      break;
    case 'REVOKED':
      await this.handleConsentRevocation(consent);
      break;
    case 'REJECTED':
      await this.handleConsentRejection(consent, additionalData);
      break;
  }

  await consent.save();

  // Log audit trail
  await this.logAuditEvent('consent_status_update', {
    consentId,
    previousStatus,
    newStatus: status,
    userId: consent.userId
  });

  // Send notification
  await this.sendConsentNotification('status_update', consent, { previousStatus });
}
```

### 3.3 Webhook Handling and Real-time Updates

#### Webhook Endpoint Implementation
```javascript
app.post('/webhook/setu', async (req, res) => {
  try {
    // Validate webhook signature
    const signature = req.headers['x-setu-signature'];
    if (!setuService.validateWebhookSignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;

    switch (event) {
      case 'CONSENT_STATUS_UPDATE':
        await enhancedConsentService.handleConsentStatusUpdate(
          data.consentId,
          data.status,
          data.additionalData
        );
        break;

      case 'DATA_READY':
        await setuService.fetchFinancialDataBySessionId(data.sessionId);
        break;

      case 'CONSENT_EXPIRY':
        await enhancedConsentService.handleConsentExpiry(data.consentId);
        break;

      default:
        logger.warn(`Unknown webhook event: ${event}`);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 3.4 Error Handling and Fallback Mechanisms

#### Comprehensive Error Handling
```javascript
class ErrorHandler {
  static async handleApiError(error, context) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      request: {
        url: context.url,
        method: context.method,
        userId: context.userId
      }
    };

    // Log error
    logger.error('API Error:', errorInfo);

    // Categorize error
    const errorCategory = this.categorizeError(error);
    
    // Apply appropriate handling
    switch (errorCategory) {
      case 'AUTHENTICATION':
        return this.handleAuthenticationError(error);
      case 'AUTHORIZATION':
        return this.handleAuthorizationError(error);
      case 'DATA_VALIDATION':
        return this.handleValidationError(error);
      case 'NETWORK':
        return this.handleNetworkError(error);
      case 'SYSTEM':
        return this.handleSystemError(error);
      case 'BUSINESS_LOGIC':
        return this.handleBusinessLogicError(error);
      default:
        return this.handleGenericError(error);
    }
  }

  static categorizeError(error) {
    if (error.name === 'AuthenticationError') return 'AUTHENTICATION';
    if (error.name === 'AuthorizationError') return 'AUTHORIZATION';
    if (error.name === 'ValidationError') return 'DATA_VALIDATION';
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') return 'NETWORK';
    if (error.code === 'ENOMEM' || error.code === 'EACCES') return 'SYSTEM';
    return 'BUSINESS_LOGIC';
  }

  static async handleNetworkError(error) {
    // Implement retry logic with exponential backoff
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.retryOperation();
        return { success: true };
      } catch (retryError) {
        if (attempt === maxRetries) {
          throw retryError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }
  }

  static async handleSystemError(error) {
    // Implement fallback mechanisms
    const fallbackData = await this.getFallbackData();
    return { success: true, data: fallbackData, fallback: true };
  }
}
```

### 3.5 Data Synchronization Across Multiple FIPs

#### Multi-FIP Data Synchronization
```javascript
class MultiFIPSynchronizer {
  async synchronizeData(userId, consentIds) {
    const results = {
      successful: [],
      failed: [],
      partial: []
    };

    // Fetch data from all FIPs concurrently
    const fetchPromises = consentIds.map(async (consentId) => {
      try {
        const data = await this.fetchDataFromFIP(consentId);
        return { consentId, success: true, data };
      } catch (error) {
        logger.error(`Failed to fetch data for consent ${consentId}:`, error);
        return { consentId, success: false, error };
      }
    });

    const fetchResults = await Promise.allSettled(fetchPromises);

    // Process results
    fetchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { consentId, success, data, error } = result.value;
        if (success) {
          results.successful.push({ consentId, data });
        } else {
          results.failed.push({ consentId, error });
        }
      } else {
        results.failed.push({ consentId: 'unknown', error: result.reason });
      }
    });

    // Merge and deduplicate data
    const mergedData = await this.mergeData(results.successful);

    // Handle partial failures
    if (results.failed.length > 0 && results.successful.length > 0) {
      results.partial = results.successful;
    }

    // Store merged data
    await this.storeMergedData(userId, mergedData);

    return results;
  }

  async mergeData(successfulFetches) {
    const mergedAccounts = new Map();
    const mergedTransactions = new Map();

    for (const { data } of successfulFetches) {
      // Merge accounts
      for (const account of data.accounts) {
        const key = `${account.fipId}_${account.accountId}`;
        if (!mergedAccounts.has(key)) {
          mergedAccounts.set(key, account);
        } else {
          // Merge account details (e.g., update balance, status)
          const existing = mergedAccounts.get(key);
          mergedAccounts.set(key, this.mergeAccountData(existing, account));
        }
      }

      // Merge transactions
      for (const transaction of data.transactions) {
        const key = transaction.transactionId;
        if (!mergedTransactions.has(key)) {
          mergedTransactions.set(key, transaction);
        }
      }
    }

    return {
      accounts: Array.from(mergedAccounts.values()),
      transactions: Array.from(mergedTransactions.values())
    };
  }

  mergeAccountData(existing, updated) {
    return {
      ...existing,
      balance: updated.balance,
      status: updated.status,
      lastFetched: updated.lastFetched,
      lastUpdated: new Date()
    };
  }
}
```

---

## 4. Best Practices

### 4.1 Data Storage Patterns

#### Sensitive Data Storage
```javascript
// Use encryption for sensitive data
const sensitiveDataSchema = {
  encryption: 'AES-256-GCM',
  keyRotation: 90, // days
  accessLogging: true,
  backupEncryption: true,
  examples: [
    'accountNumbers',
    'panNumbers',
    'aadhaarNumbers',
    'policyNumbers',
    'folioNumbers'
  ]
};
```

#### Financial Data Storage
```javascript
const financialDataSchema = {
  encryption: 'AES-256-GCM',
  auditTrail: true,
  versioning: true,
  retentionPolicy: true,
  examples: [
    'balances',
    'transactions',
    'investments',
    'premiums'
  ]
};
```

### 4.2 User Consent Management UI/UX

#### Progressive Consent Flow
```typescript
interface ConsentFlow {
  steps: [
    'welcome',
    'data_types_selection',
    'fip_selection',
    'permissions_granular',
    'time_period_selection',
    'frequency_selection',
    'purpose_explanation',
    'review_and_confirm',
    'authentication',
    'confirmation'
  ];
  
  progressiveDisclosure: {
    basic: ['dataTypes', 'timePeriod'];
    detailed: ['permissions', 'frequency', 'purpose'];
    advanced: ['dataRetention', 'revocationRights', 'complaints'];
  };
}
```

#### Visual Design Principles
```typescript
interface VisualDesign {
  colorScheme: {
    primary: '#1E40AF'; // Blue for trust
    secondary: '#059669'; // Green for success
    warning: '#DC2626'; // Red for warnings
    neutral: '#6B7280'; // Gray for neutral
  };
  typography: {
    headings: 'Inter, sans-serif';
    body: 'Inter, sans-serif';
    sizes: {
      small: '14px';
      medium: '16px';
      large: '18px';
      xlarge: '24px';
    };
  };
}
```

### 4.3 Monitoring and Alerting

#### System Health Monitoring
```javascript
const systemHealthMetrics = [
  {
    name: 'api_response_time',
    threshold: 2000, // ms
    alert: 'high'
  },
  {
    name: 'error_rate',
    threshold: 0.05, // 5%
    alert: 'high'
  },
  {
    name: 'database_connections',
    threshold: 80, // percentage
    alert: 'medium'
  },
  {
    name: 'memory_usage',
    threshold: 85, // percentage
    alert: 'medium'
  },
  {
    name: 'disk_usage',
    threshold: 90, // percentage
    alert: 'high'
  }
];
```

#### Compliance Monitoring
```javascript
const complianceMetrics = [
  {
    name: 'data_retention_violations',
    threshold: 0,
    alert: 'critical'
  },
  {
    name: 'consent_expiry_violations',
    threshold: 0,
    alert: 'critical'
  },
  {
    name: 'audit_log_gaps',
    threshold: 0,
    alert: 'high'
  },
  {
    name: 'encryption_key_rotation',
    threshold: 90, // days
    alert: 'medium'
  },
  {
    name: 'access_control_violations',
    threshold: 0,
    alert: 'high'
  }
];
```

### 4.4 Data Access Controls and User Permissions

#### Role-Based Access Control (RBAC)
```javascript
const roles = {
  USER: {
    permissions: [
      'view_own_data',
      'manage_own_consents',
      'download_own_data',
      'revoke_own_consents'
    ],
    dataAccess: 'own_data_only'
  },
  ADMIN: {
    permissions: [
      'view_all_data',
      'manage_all_consents',
      'system_configuration',
      'user_management',
      'compliance_reports'
    ],
    dataAccess: 'all_data'
  },
  COMPLIANCE_OFFICER: {
    permissions: [
      'view_compliance_reports',
      'audit_logs',
      'data_retention_management',
      'consent_lifecycle_management'
    ],
    dataAccess: 'compliance_data_only'
  }
};
```

### 4.5 Backup and Disaster Recovery

#### Backup Strategy
```javascript
const backupStrategy = {
  database: {
    frequency: 'daily',
    retention: '30_days',
    type: 'incremental',
    encryption: true,
    compression: true,
    verification: true
  },
  filesystem: {
    frequency: 'daily',
    retention: '30_days',
    type: 'full',
    encryption: true,
    compression: true
  },
  configuration: {
    frequency: 'weekly',
    retention: '90_days',
    type: 'full',
    encryption: true,
    versioning: true
  },
  logs: {
    frequency: 'hourly',
    retention: '365_days',
    type: 'incremental',
    encryption: true,
    compression: true
  }
};
```

#### Disaster Recovery
```javascript
const disasterRecovery = {
  rto: {
    critical: '4_hours',
    important: '24_hours',
    normal: '72_hours'
  },
  rpo: {
    critical: '1_hour',
    important: '24_hours',
    normal: '72_hours'
  },
  locations: [
    {
      type: 'primary',
      location: 'on_premise',
      distance: '0_km'
    },
    {
      type: 'secondary',
      location: 'cloud',
      distance: '100_km'
    },
    {
      type: 'tertiary',
      location: 'cloud',
      distance: '500_km'
    }
  ]
};
```

---

## 5. Implementation Checklist

### 5.1 Pre-Implementation Checklist

- [ ] **Regulatory Compliance**
  - [ ] RBI Account Aggregator license obtained
  - [ ] ReBIT framework compliance verified
  - [ ] Data localization requirements met
  - [ ] KYC/AML compliance established

- [ ] **Technical Infrastructure**
  - [ ] Secure hosting environment setup
  - [ ] Database with encryption at rest
  - [ ] Network security (firewall, VPN, DDoS protection)
  - [ ] Monitoring and alerting systems
  - [ ] Backup and disaster recovery systems

- [ ] **Security Implementation**
  - [ ] Multi-factor authentication
  - [ ] Role-based access control
  - [ ] Audit logging system
  - [ ] Encryption key management
  - [ ] Data loss prevention

### 5.2 Development Checklist

- [ ] **Database Design**
  - [ ] Enhanced account schema with TTL indexes
  - [ ] Transaction schema with compliance fields
  - [ ] Consent management schema
  - [ ] Audit trail schema
  - [ ] Proper indexing strategy

- [ ] **API Implementation**
  - [ ] Consent creation and management APIs
  - [ ] Data fetch APIs with proper validation
  - [ ] Webhook handling for real-time updates
  - [ ] Error handling and fallback mechanisms
  - [ ] Rate limiting and security measures

- [ ] **Frontend Implementation**
  - [ ] User-friendly consent management UI
  - [ ] Progressive disclosure of consent options
  - [ ] Real-time status updates
  - [ ] Mobile-responsive design
  - [ ] Accessibility compliance

### 5.3 Testing Checklist

- [ ] **Functional Testing**
  - [ ] Consent creation and management
  - [ ] Data fetching from multiple FIPs
  - [ ] Webhook processing
  - [ ] Error handling scenarios
  - [ ] Data synchronization

- [ ] **Security Testing**
  - [ ] Authentication and authorization
  - [ ] Data encryption verification
  - [ ] Audit trail validation
  - [ ] Penetration testing
  - [ ] Vulnerability assessment

- [ ] **Compliance Testing**
  - [ ] Data retention policy validation
  - [ ] Consent lifecycle management
  - [ ] Audit log completeness
  - [ ] Regulatory reporting
  - [ ] Data deletion verification

### 5.4 Deployment Checklist

- [ ] **Production Environment**
  - [ ] Secure production deployment
  - [ ] SSL/TLS certificates
  - [ ] Monitoring and alerting
  - [ ] Backup systems
  - [ ] Disaster recovery procedures

- [ ] **Documentation**
  - [ ] API documentation
  - [ ] User guides
  - [ ] Compliance documentation
  - [ ] Disaster recovery procedures
  - [ ] Incident response plans

### 5.5 Post-Deployment Checklist

- [ ] **Monitoring and Maintenance**
  - [ ] System health monitoring
  - [ ] Performance monitoring
  - [ ] Security monitoring
  - [ ] Compliance monitoring
  - [ ] Regular security audits

- [ ] **Continuous Improvement**
  - [ ] User feedback collection
  - [ ] Performance optimization
  - [ ] Security updates
  - [ ] Feature enhancements
  - [ ] Regulatory updates

---

## 6. References

### 6.1 Regulatory Documents
- [RBI Master Direction - NBFC Account Aggregator (AA) Directions, 2016](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10425)
- [RBI Circular on Data Localization, 2018](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11244)
- [ReBIT Technical Specifications v1.0](https://rebit.org.in/technical-specifications)

### 6.2 Security Standards
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [ISO 27001 Information Security Management](https://www.iso.org/isoiec-27001-information-security.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### 6.3 Technical References
- [Setu API Documentation](https://docs.setu.co/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/core/best-practices/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### 6.4 Compliance Resources
- [IT Act, 2000 and IT Rules, 2011](https://meity.gov.in/content/information-technology-act-2000)
- [Aadhaar Act, 2016](https://uidai.gov.in/images/aadhaar_act_2016.pdf)
- [Personal Data Protection Bill](https://meity.gov.in/data-protection-framework)

---

## Conclusion

This comprehensive guide provides a complete framework for building a compliant FIU application using India's Account Aggregator framework. The implementation includes:

1. **Complete financial data type support** with detailed schemas
2. **Full compliance implementation** with RBI and ReBIT requirements
3. **Robust technical architecture** with security and scalability
4. **Best practices** for UI/UX, monitoring, and disaster recovery
5. **Comprehensive implementation checklist** for successful deployment

The provided code examples and configurations can be directly implemented in your React Native/Node.js application. Remember to:

- Regularly update compliance requirements as regulations evolve
- Conduct periodic security audits and penetration testing
- Monitor system performance and user feedback
- Maintain comprehensive documentation and audit trails
- Implement continuous improvement processes

For additional support or clarification on specific implementation details, refer to the official RBI and ReBIT documentation, or consult with compliance experts in the financial technology domain.
