/**
 * Best Practices Configuration for Account Aggregator Framework
 * Based on RBI Guidelines, ReBIT Specifications, and Industry Standards
 * 
 * References:
 * - RBI Master Direction - NBFC Account Aggregator (AA) Directions, 2016
 * - ReBIT Technical Specifications v1.0
 * - OWASP Security Guidelines
 * - ISO 27001 Information Security Management
 */

export const BEST_PRACTICES_CONFIG = {
  // Data Storage Patterns
  DATA_STORAGE: {
    // Recommended storage patterns for different data types
    PATTERNS: {
      // Sensitive data (encrypted at rest)
      SENSITIVE: {
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
      },

      // Financial data (encrypted, with audit trail)
      FINANCIAL: {
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
      },

      // Metadata (encrypted, with access controls)
      METADATA: {
        encryption: 'AES-128-GCM',
        accessControls: true,
        logging: true,
        examples: [
          'accountTypes',
          'bankNames',
          'transactionCategories',
          'consentStatus'
        ]
      },

      // Analytics data (aggregated, anonymized)
      ANALYTICS: {
        anonymization: true,
        aggregation: true,
        retentionPolicy: true,
        examples: [
          'spendingPatterns',
          'investmentTrends',
          'riskMetrics',
          'portfolioAllocation'
        ]
      }
    },

    // Database design patterns
    DATABASE_PATTERNS: {
      // Sharding strategy
      SHARDING: {
        strategy: 'USER_BASED',
        shardKey: 'userId',
        benefits: [
          'Improved query performance',
          'Better data isolation',
          'Easier compliance management'
        ]
      },

      // Indexing strategy
      INDEXING: {
        primary: ['userId', 'consentId'],
        secondary: ['status', 'expiresAt', 'lastFetched'],
        compound: [
          ['userId', 'status'],
          ['consentId', 'accountId'],
          ['fipId', 'lastFetched']
        ]
      },

      // Partitioning strategy
      PARTITIONING: {
        strategy: 'TIME_BASED',
        partitionKey: 'createdAt',
        interval: 'MONTHLY',
        benefits: [
          'Faster data archival',
          'Improved query performance',
          'Easier compliance cleanup'
        ]
      }
    }
  },

  // User Consent Management UI/UX
  CONSENT_UI_UX: {
    // Consent flow design
    CONSENT_FLOW: {
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
      ],
      
      // Progressive disclosure
      progressiveDisclosure: {
        basic: ['dataTypes', 'timePeriod'],
        detailed: ['permissions', 'frequency', 'purpose'],
        advanced: ['dataRetention', 'revocationRights', 'complaints']
      },

      // Visual design principles
      visualDesign: {
        colorScheme: {
          primary: '#1E40AF', // Blue for trust
          secondary: '#059669', // Green for success
          warning: '#DC2626', // Red for warnings
          neutral: '#6B7280' // Gray for neutral
        },
        typography: {
          headings: 'Inter, sans-serif',
          body: 'Inter, sans-serif',
          sizes: {
            small: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '24px'
          }
        },
        spacing: {
          small: '8px',
          medium: '16px',
          large: '24px',
          xlarge: '32px'
        }
      }
    },

    // Consent management dashboard
    DASHBOARD: {
      sections: [
        {
          title: 'Active Consents',
          type: 'active_consents',
          priority: 'high'
        },
        {
          title: 'Data Overview',
          type: 'data_summary',
          priority: 'high'
        },
        {
          title: 'Expiring Soon',
          type: 'expiring_consents',
          priority: 'medium'
        },
        {
          title: 'Recent Activity',
          type: 'activity_log',
          priority: 'medium'
        },
        {
          title: 'Analytics',
          type: 'analytics',
          priority: 'low'
        }
      ],

      // Quick actions
      quickActions: [
        'revoke_consent',
        'extend_consent',
        'download_data',
        'view_details',
        'manage_notifications'
      ]
    },

    // Notification preferences
    NOTIFICATIONS: {
      channels: [
        {
          type: 'email',
          default: true,
          frequency: 'immediate'
        },
        {
          type: 'sms',
          default: false,
          frequency: 'daily'
        },
        {
          type: 'push',
          default: true,
          frequency: 'immediate'
        },
        {
          type: 'in_app',
          default: true,
          frequency: 'immediate'
        }
      ],

      events: [
        {
          type: 'consent_created',
          channels: ['email', 'push'],
          template: 'consent_created'
        },
        {
          type: 'consent_activated',
          channels: ['email', 'push'],
          template: 'consent_activated'
        },
        {
          type: 'consent_expiring',
          channels: ['email', 'sms', 'push'],
          template: 'consent_expiring'
        },
        {
          type: 'consent_expired',
          channels: ['email', 'push'],
          template: 'consent_expired'
        },
        {
          type: 'data_accessed',
          channels: ['email'],
          template: 'data_accessed'
        },
        {
          type: 'unusual_activity',
          channels: ['email', 'sms', 'push'],
          template: 'unusual_activity'
        }
      ]
    }
  },

  // Monitoring and Alerting
  MONITORING: {
    // System health monitoring
    SYSTEM_HEALTH: {
      metrics: [
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
      ],

      // Health checks
      healthChecks: [
        {
          name: 'database_connectivity',
          interval: 30, // seconds
          timeout: 5 // seconds
        },
        {
          name: 'setu_api_connectivity',
          interval: 60, // seconds
          timeout: 10 // seconds
        },
        {
          name: 'webhook_endpoint',
          interval: 120, // seconds
          timeout: 5 // seconds
        },
        {
          name: 'encryption_service',
          interval: 300, // seconds
          timeout: 2 // seconds
        }
      ]
    },

    // Compliance monitoring
    COMPLIANCE_MONITORING: {
      metrics: [
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
      ],

      // Compliance checks
      complianceChecks: [
        {
          name: 'data_lifecycle_management',
          frequency: 'daily',
          description: 'Check for expired data that needs deletion'
        },
        {
          name: 'consent_lifecycle_management',
          frequency: 'daily',
          description: 'Check for expired consents that need handling'
        },
        {
          name: 'audit_trail_integrity',
          frequency: 'weekly',
          description: 'Verify audit trail completeness and integrity'
        },
        {
          name: 'encryption_key_management',
          frequency: 'monthly',
          description: 'Check encryption key rotation and management'
        },
        {
          name: 'access_control_review',
          frequency: 'monthly',
          description: 'Review and validate access controls'
        }
      ]
    },

    // Business metrics
    BUSINESS_METRICS: {
      userMetrics: [
        {
          name: 'active_users',
          frequency: 'daily',
          aggregation: 'count'
        },
        {
          name: 'consent_conversion_rate',
          frequency: 'daily',
          aggregation: 'percentage'
        },
        {
          name: 'data_fetch_success_rate',
          frequency: 'hourly',
          aggregation: 'percentage'
        },
        {
          name: 'user_satisfaction_score',
          frequency: 'weekly',
          aggregation: 'average'
        }
      ],

      operationalMetrics: [
        {
          name: 'consents_created',
          frequency: 'daily',
          aggregation: 'count'
        },
        {
          name: 'consents_expired',
          frequency: 'daily',
          aggregation: 'count'
        },
        {
          name: 'data_fetches_completed',
          frequency: 'hourly',
          aggregation: 'count'
        },
        {
          name: 'webhook_events_processed',
          frequency: 'hourly',
          aggregation: 'count'
        }
      ]
    },

    // Alerting configuration
    ALERTING: {
      channels: [
        {
          type: 'email',
          recipients: ['admin@company.com', 'compliance@company.com'],
          priority: ['critical', 'high']
        },
        {
          type: 'slack',
          channel: '#alerts',
          priority: ['critical', 'high', 'medium']
        },
        {
          type: 'sms',
          recipients: ['+91XXXXXXXXXX'],
          priority: ['critical']
        },
        {
          type: 'pagerduty',
          service: 'account-aggregator',
          priority: ['critical']
        }
      ],

      escalation: {
        levels: [
          {
            level: 1,
            delay: 0, // immediate
            channels: ['email', 'slack', 'sms']
          },
          {
            level: 2,
            delay: 300, // 5 minutes
            channels: ['email', 'slack', 'pagerduty']
          },
          {
            level: 3,
            delay: 1800, // 30 minutes
            channels: ['email', 'pagerduty']
          }
        ]
      }
    }
  },

  // Data Access Controls and User Permissions
  ACCESS_CONTROLS: {
    // Role-based access control (RBAC)
    ROLES: {
      // User roles
      USER: {
        permissions: [
          'view_own_data',
          'manage_own_consents',
          'download_own_data',
          'revoke_own_consents'
        ],
        dataAccess: 'own_data_only'
      },

      // Admin roles
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

      // Compliance roles
      COMPLIANCE_OFFICER: {
        permissions: [
          'view_compliance_reports',
          'audit_logs',
          'data_retention_management',
          'consent_lifecycle_management'
        ],
        dataAccess: 'compliance_data_only'
      },

      // Support roles
      SUPPORT: {
        permissions: [
          'view_user_issues',
          'basic_user_support',
          'view_system_status'
        ],
        dataAccess: 'limited_user_data'
      }
    },

    // Permission matrix
    PERMISSIONS: {
      // Data access permissions
      dataAccess: {
        'view_own_data': {
          description: 'View own financial data',
          scope: 'user_own_data',
          auditRequired: true
        },
        'view_all_data': {
          description: 'View all user data',
          scope: 'all_data',
          auditRequired: true,
          approvalRequired: true
        },
        'download_own_data': {
          description: 'Download own data',
          scope: 'user_own_data',
          auditRequired: true,
          rateLimit: 'daily'
        },
        'export_data': {
          description: 'Export data for compliance',
          scope: 'all_data',
          auditRequired: true,
          approvalRequired: true
        }
      },

      // Consent management permissions
      consentManagement: {
        'manage_own_consents': {
          description: 'Manage own consents',
          scope: 'user_own_consents',
          auditRequired: true
        },
        'manage_all_consents': {
          description: 'Manage all consents',
          scope: 'all_consents',
          auditRequired: true,
          approvalRequired: true
        },
        'revoke_own_consents': {
          description: 'Revoke own consents',
          scope: 'user_own_consents',
          auditRequired: true
        },
        'revoke_all_consents': {
          description: 'Revoke any consent',
          scope: 'all_consents',
          auditRequired: true,
          approvalRequired: true
        }
      },

      // System management permissions
      systemManagement: {
        'system_configuration': {
          description: 'Configure system settings',
          scope: 'system',
          auditRequired: true,
          approvalRequired: true
        },
        'user_management': {
          description: 'Manage user accounts',
          scope: 'users',
          auditRequired: true,
          approvalRequired: true
        },
        'compliance_reports': {
          description: 'Generate compliance reports',
          scope: 'compliance',
          auditRequired: true
        }
      }
    },

    // Access control policies
    POLICIES: {
      // Principle of least privilege
      leastPrivilege: {
        enabled: true,
        defaultPermissions: 'minimal',
        escalationRequired: true
      },

      // Segregation of duties
      segregationOfDuties: {
        enabled: true,
        conflictingRoles: [
          ['USER', 'ADMIN'],
          ['COMPLIANCE_OFFICER', 'SUPPORT']
        ]
      },

      // Regular access review
      accessReview: {
        frequency: 'quarterly',
        reviewers: ['compliance_officer', 'security_team'],
        autoRevocation: true
      },

      // Session management
      sessionManagement: {
        timeout: 3600, // seconds
        maxSessions: 3,
        concurrentLogin: false,
        deviceTracking: true
      }
    }
  },

  // Backup and Disaster Recovery
  BACKUP_DR: {
    // Backup strategy
    BACKUP_STRATEGY: {
      // Database backups
      database: {
        frequency: 'daily',
        retention: '30_days',
        type: 'incremental',
        encryption: true,
        compression: true,
        verification: true
      },

      // File system backups
      filesystem: {
        frequency: 'daily',
        retention: '30_days',
        type: 'full',
        encryption: true,
        compression: true
      },

      // Configuration backups
      configuration: {
        frequency: 'weekly',
        retention: '90_days',
        type: 'full',
        encryption: true,
        versioning: true
      },

      // Log backups
      logs: {
        frequency: 'hourly',
        retention: '365_days',
        type: 'incremental',
        encryption: true,
        compression: true
      }
    },

    // Disaster recovery
    DISASTER_RECOVERY: {
      // Recovery time objectives (RTO)
      rto: {
        critical: '4_hours',
        important: '24_hours',
        normal: '72_hours'
      },

      // Recovery point objectives (RPO)
      rpo: {
        critical: '1_hour',
        important: '24_hours',
        normal: '72_hours'
      },

      // Backup locations
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
      ],

      // Recovery procedures
      procedures: [
        {
          name: 'database_recovery',
          priority: 'critical',
          estimatedTime: '2_hours',
          dependencies: ['backup_verification', 'system_restore']
        },
        {
          name: 'application_recovery',
          priority: 'important',
          estimatedTime: '1_hour',
          dependencies: ['database_recovery']
        },
        {
          name: 'data_validation',
          priority: 'normal',
          estimatedTime: '4_hours',
          dependencies: ['application_recovery']
        }
      ]
    },

    // Testing and validation
    TESTING: {
      // Backup testing
      backupTesting: {
        frequency: 'monthly',
        type: 'restore_test',
        validation: 'data_integrity',
        documentation: true
      },

      // Disaster recovery testing
      drTesting: {
        frequency: 'quarterly',
        type: 'full_recovery_test',
        validation: 'end_to_end',
        documentation: true
      },

      // Failover testing
      failoverTesting: {
        frequency: 'monthly',
        type: 'automated_failover',
        validation: 'service_availability',
        documentation: true
      }
    }
  },

  // Security Best Practices
  SECURITY: {
    // Authentication
    AUTHENTICATION: {
      // Multi-factor authentication
      mfa: {
        required: true,
        methods: ['totp', 'sms', 'email'],
        backupCodes: true,
        rememberDevice: true
      },

      // Password policy
      passwordPolicy: {
        minLength: 12,
        complexity: true,
        history: 5,
        expiry: 90, // days
        lockout: {
          attempts: 5,
          duration: 30 // minutes
        }
      },

      // Session management
      sessionManagement: {
        timeout: 3600, // seconds
        refreshToken: true,
        deviceTracking: true,
        concurrentLogin: false
      }
    },

    // Network security
    NETWORK_SECURITY: {
      // Firewall configuration
      firewall: {
        inbound: ['https', 'ssh'],
        outbound: ['https', 'dns'],
        defaultPolicy: 'deny'
      },

      // VPN requirements
      vpn: {
        required: true,
        type: 'ipsec',
        authentication: 'certificate_based'
      },

      // DDoS protection
      ddosProtection: {
        enabled: true,
        provider: 'cloudflare',
        mitigation: 'automatic'
      }
    },

    // Data protection
    DATA_PROTECTION: {
      // Encryption
      encryption: {
        atRest: 'AES-256-GCM',
        inTransit: 'TLS 1.3',
        keyManagement: 'hardware_security_module'
      },

      // Data classification
      dataClassification: {
        public: 'no_encryption',
        internal: 'AES-128',
        confidential: 'AES-256',
        restricted: 'AES-256 + additional_controls'
      },

      // Data loss prevention
      dlp: {
        enabled: true,
        scanning: 'real_time',
        actions: ['block', 'quarantine', 'log']
      }
    }
  }
};

// Helper functions for best practices
export const getDataStoragePattern = (dataType: string) => {
  return BEST_PRACTICES_CONFIG.DATA_STORAGE.PATTERNS[dataType as keyof typeof BEST_PRACTICES_CONFIG.DATA_STORAGE.PATTERNS];
};

export const getRolePermissions = (role: string) => {
  return BEST_PRACTICES_CONFIG.ACCESS_CONTROLS.ROLES[role as keyof typeof BEST_PRACTICES_CONFIG.ACCESS_CONTROLS.ROLES];
};

export const validateSecurityCompliance = (config: any) => {
  const violations = [];
  
  // Check encryption
  if (config.encryption?.atRest !== 'AES-256-GCM') {
    violations.push('Data at rest must be encrypted with AES-256-GCM');
  }
  
  // Check MFA
  if (!config.authentication?.mfa?.required) {
    violations.push('Multi-factor authentication is required');
  }
  
  // Check session timeout
  if (config.sessionManagement?.timeout > 3600) {
    violations.push('Session timeout must not exceed 1 hour');
  }
  
  return violations;
};

export const getMonitoringMetrics = (category: string) => {
  return BEST_PRACTICES_CONFIG.MONITORING[category as keyof typeof BEST_PRACTICES_CONFIG.MONITORING];
};

export const getBackupStrategy = (dataType: string) => {
  return BEST_PRACTICES_CONFIG.BACKUP_DR.BACKUP_STRATEGY[dataType as keyof typeof BEST_PRACTICES_CONFIG.BACKUP_DR.BACKUP_STRATEGY];
};
