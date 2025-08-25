# FIU Application Implementation Guide - India's Account Aggregator Framework

## 1. Financial Data Types & Access

### Supported fiTypes
- **DEPOSIT**: Savings, Current, Fixed Deposit accounts
- **MUTUAL_FUNDS**: Mutual fund holdings, NAV, units
- **INSURANCE_POLICIES**: Life, health, motor insurance
- **EQUITIES**: Direct equity holdings, demat accounts
- **EPF**: Employee Provident Fund
- **PPF**: Public Provident Fund
- **NPS**: National Pension System
- **GOLD**: Sovereign Gold Bonds, digital gold
- **FIXED_DEPOSITS**: Fixed deposit accounts
- **RECURRING_DEPOSITS**: Recurring deposit accounts

### Data Access Modes
- **VIEW**: One-time viewing, no storage
- **STORE**: Data storage and processing (180 days)
- **QUERY**: On-demand access (30 days)
- **STREAM**: Real-time streaming (7 days)

### Transaction Data Granularity
```typescript
// Basic
interface BasicTransaction {
  transactionId: string;
  amount: number;
  transactionType: 'CREDIT' | 'DEBIT';
  transactionDate: Date;
  description: string;
  balance: number;
}

// Enhanced
interface EnhancedTransaction extends BasicTransaction {
  category: string;
  merchantName: string;
  upiId: string;
  merchantCategoryCode: string;
  cardLastFourDigits: string;
  internationalTransaction: boolean;
  cashbackEarned: number;
}
```

## 2. Compliance & Regulatory Requirements

### Data Retention (Mandatory)
- Consent Records: 365 days
- Transaction Data: 180 days
- Account Data: 180 days
- Audit Logs: 1095 days (3 years)
- User Sessions: 90 days
- Compliance Reports: 1825 days (5 years)

### Security Requirements
```typescript
interface SecurityConfig {
  encryption: {
    atRest: 'AES-256-GCM';
    inTransit: 'TLS 1.3';
    keyRotation: 90; // days
  };
  authentication: {
    mfa: true;
    sessionTimeout: 3600; // seconds
    maxLoginAttempts: 5;
  };
  accessControls: {
    roleBased: true;
    leastPrivilege: true;
    segregationOfDuties: true;
  };
}
```

### Consent Management
- Granular permissions (data types, time period, frequency)
- Expiry notifications (30, 7, 1 days before)
- Auto-revocation after grace period
- Immediate effect on revocation

### Audit Trail
```typescript
interface AuditEvent {
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

## 3. Technical Implementation

### Enhanced Database Schema
```javascript
// Enhanced Account Schema with TTL indexes
const enhancedAccountSchema = new mongoose.Schema({
  // Basic fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  consentId: { type: String, required: true, index: true },
  accountId: { type: String, required: true, index: true },
  accountNumber: { type: String, required: true, encrypted: true },
  fiType: { type: String, enum: [...], required: true },
  
  // Investment specific fields
  units: Number,
  nav: Number,
  currentValue: Number,
  schemeName: String,
  folioNumber: { type: String, encrypted: true },
  
  // Insurance specific fields
  policyNumber: { type: String, encrypted: true },
  sumAssured: Number,
  premiumAmount: Number,
  
  // Compliance fields
  consentExpiryDate: { type: Date, required: true, index: true },
  dataLifeExpiryDate: { type: Date, required: true, index: true },
  
  // TTL indexes for automatic deletion
  deleteAt: {
    type: Date,
    default: function() {
      const deleteDate = new Date();
      deleteDate.setDate(deleteDate.getDate() + 180);
      return deleteDate;
    },
    index: { expireAfterSeconds: 0 }
  }
});
```

### Enhanced Consent Service
```javascript
class EnhancedConsentService {
  async createConsent(consentData) {
    // Validate consent data
    const validationResult = this.validateConsentData(consentData);
    if (!validationResult.isValid) {
      throw new Error(`Consent validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Check existing consents
    const existingConsent = await this.checkExistingConsent(consentData.userId, consentData.fipId);
    if (existingConsent) return existingConsent;

    // Create with Setu
    const setuResponse = await setuService.createConsentRequest(consentData);
    
    // Store in database
    const consent = new Consent({
      userId: consentData.userId,
      consentId: setuResponse.consentId,
      fipId: consentData.fipId,
      dataLife: consentData.dataLife || 180,
      permissions: consentData.permissions,
      expiresAt: new Date(Date.now() + (consentData.dataLife || 180) * 24 * 60 * 60 * 1000)
    });

    await consent.save();
    
    // Log audit and send notification
    await this.logAuditEvent('consent_creation', { userId: consentData.userId, consentId: setuResponse.consentId });
    await this.sendConsentNotification('creation', consent);

    return setuResponse;
  }

  async handleConsentStatusUpdate(consentId, status, additionalData = {}) {
    const consent = await Consent.findOne({ consentId });
    if (!consent) throw new Error(`Consent not found: ${consentId}`);

    const previousStatus = consent.status;
    consent.status = status;
    consent.lastUpdated = new Date();

    // Handle specific status updates
    switch (status) {
      case 'ACTIVE':
        await this.handleConsentActivation(consent);
        break;
      case 'EXPIRED':
        await this.handleConsentExpiry(consent);
        break;
      case 'REVOKED':
        await this.handleConsentRevocation(consent);
        break;
    }

    await consent.save();
    
    // Log audit trail
    await this.logAuditEvent('consent_status_update', {
      consentId, previousStatus, newStatus: status, userId: consent.userId
    });
  }
}
```

### Webhook Handling
```javascript
app.post('/webhook/setu', async (req, res) => {
  try {
    // Validate signature
    const signature = req.headers['x-setu-signature'];
    if (!setuService.validateWebhookSignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;

    switch (event) {
      case 'CONSENT_STATUS_UPDATE':
        await enhancedConsentService.handleConsentStatusUpdate(
          data.consentId, data.status, data.additionalData
        );
        break;
      case 'DATA_READY':
        await setuService.fetchFinancialDataBySessionId(data.sessionId);
        break;
      case 'CONSENT_EXPIRY':
        await enhancedConsentService.handleConsentExpiry(data.consentId);
        break;
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Multi-FIP Data Synchronization
```javascript
class MultiFIPSynchronizer {
  async synchronizeData(userId, consentIds) {
    const results = { successful: [], failed: [], partial: [] };

    // Fetch from all FIPs concurrently
    const fetchPromises = consentIds.map(async (consentId) => {
      try {
        const data = await this.fetchDataFromFIP(consentId);
        return { consentId, success: true, data };
      } catch (error) {
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
      }
    });

    // Merge and deduplicate data
    const mergedData = await this.mergeData(results.successful);
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
}
```

## 4. Best Practices

### Data Storage Patterns
```typescript
const DATA_STORAGE_PATTERNS = {
  SENSITIVE: {
    encryption: 'AES-256-GCM',
    keyRotation: 90,
    accessLogging: true,
    examples: ['accountNumbers', 'panNumbers', 'aadhaarNumbers']
  },
  FINANCIAL: {
    encryption: 'AES-256-GCM',
    auditTrail: true,
    versioning: true,
    examples: ['balances', 'transactions', 'investments']
  },
  METADATA: {
    encryption: 'AES-128-GCM',
    accessControls: true,
    examples: ['accountTypes', 'bankNames', 'categories']
  }
};
```

### Monitoring and Alerting
```typescript
const MONITORING_METRICS = {
  SYSTEM_HEALTH: [
    { name: 'api_response_time', threshold: 2000, alert: 'high' },
    { name: 'error_rate', threshold: 0.05, alert: 'high' },
    { name: 'database_connections', threshold: 80, alert: 'medium' }
  ],
  COMPLIANCE: [
    { name: 'data_retention_violations', threshold: 0, alert: 'critical' },
    { name: 'consent_expiry_violations', threshold: 0, alert: 'critical' },
    { name: 'audit_log_gaps', threshold: 0, alert: 'high' }
  ]
};
```

### Access Controls
```typescript
const ROLES = {
  USER: {
    permissions: ['view_own_data', 'manage_own_consents', 'download_own_data'],
    dataAccess: 'own_data_only'
  },
  ADMIN: {
    permissions: ['view_all_data', 'manage_all_consents', 'system_configuration'],
    dataAccess: 'all_data'
  },
  COMPLIANCE_OFFICER: {
    permissions: ['view_compliance_reports', 'audit_logs', 'data_retention_management'],
    dataAccess: 'compliance_data_only'
  }
};
```

### Backup and Disaster Recovery
```typescript
const BACKUP_STRATEGY = {
  database: {
    frequency: 'daily',
    retention: '30_days',
    type: 'incremental',
    encryption: true
  },
  disasterRecovery: {
    rto: { critical: '4_hours', important: '24_hours' },
    rpo: { critical: '1_hour', important: '24_hours' }
  }
};
```

## 5. Implementation Checklist

### Pre-Implementation
- [ ] RBI Account Aggregator license
- [ ] ReBIT framework compliance
- [ ] Data localization setup
- [ ] Security infrastructure
- [ ] Monitoring systems

### Development
- [ ] Enhanced database schemas with TTL
- [ ] Consent management service
- [ ] Webhook handling
- [ ] Multi-FIP synchronization
- [ ] Error handling and fallbacks
- [ ] Audit logging system

### Testing
- [ ] Functional testing (consent, data fetch, webhooks)
- [ ] Security testing (auth, encryption, audit)
- [ ] Compliance testing (retention, lifecycle)
- [ ] Performance testing
- [ ] Disaster recovery testing

### Deployment
- [ ] Production environment setup
- [ ] SSL/TLS certificates
- [ ] Monitoring and alerting
- [ ] Backup systems
- [ ] Documentation

### Post-Deployment
- [ ] System health monitoring
- [ ] Performance monitoring
- [ ] Security monitoring
- [ ] Compliance monitoring
- [ ] Regular audits

## 6. Key Configuration Files

### Financial Data Types (`src/config/financialDataTypes.ts`)
- Complete fiTypes configuration
- Data access modes
- Transaction granularity levels
- Account data schemas

### Compliance (`src/config/compliance.ts`)
- Data retention requirements
- Security configurations
- Audit trail specifications
- Regulatory compliance settings

### Best Practices (`src/config/bestPractices.ts`)
- Data storage patterns
- Monitoring configurations
- Access control policies
- Backup strategies

## 7. References

### Regulatory
- [RBI Master Direction - NBFC Account Aggregator (AA) Directions, 2016](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10425)
- [ReBIT Technical Specifications v1.0](https://rebit.org.in/technical-specifications)

### Technical
- [Setu API Documentation](https://docs.setu.co/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/core/best-practices/)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

### Compliance
- [IT Act, 2000 and IT Rules, 2011](https://meity.gov.in/content/information-technology-act-2000)
- [Aadhaar Act, 2016](https://uidai.gov.in/images/aadhaar_act_2016.pdf)

---

This guide provides a complete framework for building a compliant FIU application. The provided code examples and configurations can be directly implemented in your React Native/Node.js application. Remember to regularly update compliance requirements and conduct periodic security audits.
