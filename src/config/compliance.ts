/**
 * Compliance & Regulatory Requirements Configuration
 * Based on RBI Account Aggregator Framework and ReBIT Specifications
 * 
 * References:
 * - RBI Master Direction - NBFC Account Aggregator (AA) Directions, 2016
 * - RBI Circular on Data Localization, 2018
 * - ReBIT Technical Specifications v1.0
 * - IT Act, 2000 and IT Rules, 2011
 * - Aadhaar Act, 2016
 */

export const COMPLIANCE_CONFIG = {
  // Data Retention Requirements
  DATA_RETENTION: {
    // Mandatory retention periods (in days)
    MANDATORY_PERIODS: {
      CONSENT_RECORDS: 365, // 1 year
      TRANSACTION_DATA: 180, // 6 months
      ACCOUNT_DATA: 180, // 6 months
      AUDIT_LOGS: 1095, // 3 years
      USER_SESSIONS: 90, // 3 months
      WEBHOOK_EVENTS: 180, // 6 months
      ERROR_LOGS: 365, // 1 year
      COMPLIANCE_REPORTS: 1825 // 5 years
    },

    // Automatic deletion triggers
    AUTO_DELETION: {
      CONSENT_EXPIRY: true,
      DATA_LIFE_EXPIRY: true,
      USER_ACCOUNT_DELETION: true,
      REGULATORY_REQUIREMENTS: true
    },

    // Data lifecycle management
    LIFECYCLE: {
      IMMEDIATE_DELETION: [
        'temporaryTokens',
        'sessionData',
        'cachedResponses'
      ],
      
      SHORT_TERM_RETENTION: [
        'userSessions',
        'apiRequests',
        'errorLogs'
      ],
      
      MEDIUM_TERM_RETENTION: [
        'transactionData',
        'accountData',
        'consentRecords'
      ],
      
      LONG_TERM_RETENTION: [
        'auditLogs',
        'complianceReports',
        'regulatoryFilings'
      ]
    }
  },

  // Consent Management Requirements
  CONSENT_MANAGEMENT: {
    // Granular permissions required
    GRANULAR_PERMISSIONS: {
      DATA_TYPES: true,
      TIME_PERIOD: true,
      FREQUENCY: true,
      PURPOSE: true,
      FIP_SELECTION: true
    },

    // Consent expiry handling
    EXPIRY_HANDLING: {
      NOTIFICATION_DAYS: [30, 7, 1], // Days before expiry to notify
      AUTO_REVOCATION: true,
      GRACE_PERIOD: 7, // Days after expiry before auto-revocation
      RENEWAL_REMINDERS: true
    },

    // Consent revocation
    REVOCATION: {
      IMMEDIATE_EFFECT: true,
      DATA_DELETION: true,
      NOTIFICATION_REQUIRED: true,
      AUDIT_TRAIL: true
    },

    // Consent validation
    VALIDATION: {
      ACTIVE_STATUS: true,
      EXPIRY_CHECK: true,
      PERMISSION_VALIDATION: true,
      FIP_AVAILABILITY: true
    }
  },

  // Security Requirements
  SECURITY: {
    // Data encryption
    ENCRYPTION: {
      AT_REST: {
        ALGORITHM: 'AES-256-GCM',
        KEY_ROTATION: 90, // days
        KEY_MANAGEMENT: 'AWS KMS' // or equivalent
      },
      
      IN_TRANSIT: {
        PROTOCOL: 'TLS 1.3',
        MINIMUM_VERSION: 'TLS 1.2',
        CIPHER_SUITES: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256']
      },
      
      API_KEYS: {
        ALGORITHM: 'RSA-2048',
        ROTATION: 365, // days
        STORAGE: 'HARDWARE_SECURITY_MODULE'
      }
    },

    // Authentication & Authorization
    AUTHENTICATION: {
      MULTI_FACTOR: true,
      SESSION_TIMEOUT: 3600, // seconds
      MAX_LOGIN_ATTEMPTS: 5,
      ACCOUNT_LOCKOUT: 1800, // seconds
      PASSWORD_POLICY: {
        MIN_LENGTH: 12,
        COMPLEXITY: true,
        EXPIRY: 90 // days
      }
    },

    // Access controls
    ACCESS_CONTROLS: {
      ROLE_BASED: true,
      PRINCIPLE_OF_LEAST_PRIVILEGE: true,
      SEGREGATION_OF_DUTIES: true,
      REGULAR_ACCESS_REVIEW: true
    },

    // Network security
    NETWORK_SECURITY: {
      FIREWALL: true,
      INTRUSION_DETECTION: true,
      DDoS_PROTECTION: true,
      VPN_REQUIRED: true,
      IP_WHITELISTING: true
    }
  },

  // Audit Trail Requirements
  AUDIT_TRAIL: {
    // Events to log
    EVENTS: {
      USER_ACTIONS: [
        'login',
        'logout',
        'consent_creation',
        'consent_revocation',
        'data_access',
        'data_export',
        'profile_update'
      ],
      
      SYSTEM_ACTIONS: [
        'data_fetch',
        'webhook_received',
        'consent_expiry',
        'data_deletion',
        'error_occurred',
        'security_event'
      ],
      
      ADMIN_ACTIONS: [
        'user_management',
        'system_configuration',
        'data_export',
        'compliance_report'
      ]
    },

    // Log retention
    RETENTION: {
      USER_ACTIONS: 1095, // 3 years
      SYSTEM_ACTIONS: 1095, // 3 years
      ADMIN_ACTIONS: 1825, // 5 years
      SECURITY_EVENTS: 2555 // 7 years
    },

    // Log format
    FORMAT: {
      TIMESTAMP: 'ISO 8601',
      USER_ID: 'required',
      IP_ADDRESS: 'required',
      USER_AGENT: 'required',
      ACTION: 'required',
      RESOURCE: 'required',
      RESULT: 'required',
      DETAILS: 'optional'
    }
  },

  // Data Transmission Security
  DATA_TRANSMISSION: {
    // API security
    API_SECURITY: {
      RATE_LIMITING: true,
      REQUEST_VALIDATION: true,
      RESPONSE_SANITIZATION: true,
      CORS_POLICY: true,
      API_VERSIONING: true
    },

    // Webhook security
    WEBHOOK_SECURITY: {
      SIGNATURE_VERIFICATION: true,
      TLS_ENCRYPTION: true,
      RETRY_MECHANISM: true,
      DEAD_LETTER_QUEUE: true,
      TIMEOUT_HANDLING: true
    },

    // Data validation
    DATA_VALIDATION: {
      INPUT_SANITIZATION: true,
      OUTPUT_ENCODING: true,
      SCHEMA_VALIDATION: true,
      SIZE_LIMITS: true
    }
  },

  // User Notification Requirements
  USER_NOTIFICATIONS: {
    // Consent notifications
    CONSENT_NOTIFICATIONS: {
      CREATION: true,
      ACTIVATION: true,
      EXPIRY_WARNING: true,
      EXPIRY: true,
      REVOCATION: true
    },

    // Data access notifications
    DATA_ACCESS: {
      FIRST_ACCESS: true,
      UNUSUAL_ACCESS: true,
      BULK_EXPORT: true,
      THIRD_PARTY_ACCESS: true
    },

    // Security notifications
    SECURITY: {
      LOGIN_ATTEMPT: true,
      PASSWORD_CHANGE: true,
      DEVICE_ADDED: true,
      SUSPICIOUS_ACTIVITY: true
    },

    // Communication channels
    CHANNELS: {
      EMAIL: true,
      SMS: true,
      PUSH_NOTIFICATION: true,
      IN_APP: true
    }
  },

  // RBI and ReBIT Compliance
  REGULATORY_COMPLIANCE: {
    // RBI requirements
    RBI: {
      DATA_LOCALIZATION: true,
      AUDIT_REQUIREMENTS: true,
      REPORTING_OBLIGATIONS: true,
      KYC_COMPLIANCE: true,
      ANTI_MONEY_LAUNDERING: true
    },

    // ReBIT framework
    REBIT: {
      TECHNICAL_SPECIFICATIONS: true,
      API_STANDARDS: true,
      SECURITY_GUIDELINES: true,
      TESTING_REQUIREMENTS: true
    },

    // Data protection
    DATA_PROTECTION: {
      PERSONAL_DATA_PROTECTION: true,
      SENSITIVE_DATA_HANDLING: true,
      DATA_MINIMIZATION: true,
      PURPOSE_LIMITATION: true
    },

    // Reporting requirements
    REPORTING: {
      MONTHLY_REPORTS: true,
      QUARTERLY_REPORTS: true,
      ANNUAL_REPORTS: true,
      INCIDENT_REPORTS: true
    }
  },

  // Error Handling and Fallback
  ERROR_HANDLING: {
    // Error categories
    ERROR_CATEGORIES: {
      AUTHENTICATION: 'HIGH',
      AUTHORIZATION: 'HIGH',
      DATA_VALIDATION: 'MEDIUM',
      NETWORK: 'MEDIUM',
      SYSTEM: 'HIGH',
      BUSINESS_LOGIC: 'MEDIUM'
    },

    // Fallback mechanisms
    FALLBACK_MECHANISMS: {
      CACHED_DATA: true,
      DEGRADED_MODE: true,
      MANUAL_PROCESS: true,
      ALTERNATE_ENDPOINTS: true
    },

    // Monitoring and alerting
    MONITORING: {
      REAL_TIME_MONITORING: true,
      ALERT_THRESHOLDS: true,
      ESCALATION_MATRIX: true,
      PERFORMANCE_METRICS: true
    }
  },

  // Data Synchronization
  DATA_SYNCHRONIZATION: {
    // Multi-FIP handling
    MULTI_FIP: {
      CONCURRENT_REQUESTS: true,
      DATA_MERGING: true,
      CONFLICT_RESOLUTION: true,
      CONSISTENCY_CHECK: true
    },

    // Real-time updates
    REAL_TIME: {
      WEBHOOK_PROCESSING: true,
      EVENT_DRIVEN_UPDATES: true,
      QUEUE_MANAGEMENT: true,
      RETRY_STRATEGY: true
    },

    // Data consistency
    CONSISTENCY: {
      TRANSACTIONAL_UPDATES: true,
      ROLLBACK_MECHANISM: true,
      DATA_INTEGRITY_CHECKS: true,
      VERSION_CONTROL: true
    }
  }
};

// Helper functions for compliance
export const getRetentionPeriod = (dataType: string) => {
  return COMPLIANCE_CONFIG.DATA_RETENTION.MANDATORY_PERIODS[dataType as keyof typeof COMPLIANCE_CONFIG.DATA_RETENTION.MANDATORY_PERIODS] || 180;
};

export const isComplianceRequired = (requirement: string) => {
  const requirements = {
    'data-localization': COMPLIANCE_CONFIG.REGULATORY_COMPLIANCE.RBI.DATA_LOCALIZATION,
    'audit-trail': COMPLIANCE_CONFIG.AUDIT_TRAIL.EVENTS.USER_ACTIONS.length > 0,
    'consent-management': COMPLIANCE_CONFIG.CONSENT_MANAGEMENT.GRANULAR_PERMISSIONS.DATA_TYPES,
    'encryption': COMPLIANCE_CONFIG.SECURITY.ENCRYPTION.AT_REST.ALGORITHM !== 'NONE'
  };
  return requirements[requirement as keyof typeof requirements] || false;
};

export const getSecurityLevel = (dataType: string) => {
  const securityLevels = {
    'personal': 'HIGH',
    'financial': 'HIGH',
    'transactional': 'MEDIUM',
    'metadata': 'LOW'
  };
  return securityLevels[dataType as keyof typeof securityLevels] || 'MEDIUM';
};

export const validateCompliance = (config: any) => {
  const violations = [];
  
  // Check data retention
  if (config.dataRetention < getRetentionPeriod('TRANSACTION_DATA')) {
    violations.push('Data retention period below minimum requirement');
  }
  
  // Check encryption
  if (!config.encryption || config.encryption.algorithm !== 'AES-256-GCM') {
    violations.push('Encryption algorithm not compliant');
  }
  
  // Check audit trail
  if (!config.auditTrail || !config.auditTrail.events) {
    violations.push('Audit trail not configured');
  }
  
  return violations;
};
