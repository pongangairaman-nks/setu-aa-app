/**
 * Comprehensive Financial Data Types Configuration
 * Based on RBI Account Aggregator Framework and ReBIT Specifications
 * 
 * References:
 * - RBI Master Direction - NBFC Account Aggregator (AA) Directions, 2016
 * - ReBIT Technical Specifications v1.0
 * - Setu API Documentation
 */

export const FINANCIAL_DATA_TYPES = {
  // Supported Financial Information Types (fiTypes)
  FI_TYPES: {
    // Banking Products
    DEPOSIT: {
      code: 'DEPOSIT',
      name: 'Deposit Accounts',
      description: 'Savings, Current, Fixed Deposit, Recurring Deposit accounts',
      dataPoints: [
        'accountNumber',
        'accountType',
        'balance',
        'currency',
        'status',
        'ifscCode',
        'branchName',
        'accountHolderName',
        'interestRate',
        'maturityDate',
        'nomineeDetails'
      ],
      supportedFIPs: ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Yes Bank'],
      retentionPeriod: 180, // days
      refreshFrequency: 'DAILY'
    },
    
    MUTUAL_FUNDS: {
      code: 'MUTUAL_FUNDS',
      name: 'Mutual Fund Investments',
      description: 'Mutual fund holdings, NAV, units, folio details',
      dataPoints: [
        'folioNumber',
        'schemeName',
        'schemeCode',
        'units',
        'nav',
        'currentValue',
        'investmentAmount',
        'amcName',
        'fundHouse',
        'schemeType',
        'lastNavDate'
      ],
      supportedFIPs: ['CAMS', 'Karvy', 'Franklin Templeton', 'HDFC AMC'],
      retentionPeriod: 180,
      refreshFrequency: 'DAILY'
    },
    
    INSURANCE_POLICIES: {
      code: 'INSURANCE_POLICIES',
      name: 'Insurance Policies',
      description: 'Life, health, motor, and other insurance policies',
      dataPoints: [
        'policyNumber',
        'policyType',
        'insurerName',
        'sumAssured',
        'premiumAmount',
        'premiumFrequency',
        'nextDueDate',
        'policyStatus',
        'maturityDate',
        'nomineeDetails',
        'coverageDetails'
      ],
      supportedFIPs: ['IRDAI', 'LIC', 'HDFC Life', 'ICICI Prudential'],
      retentionPeriod: 180,
      refreshFrequency: 'MONTHLY'
    },
    
    EQUITIES: {
      code: 'EQUITIES',
      name: 'Equity Investments',
      description: 'Direct equity holdings, demat account details',
      dataPoints: [
        'dematAccountNumber',
        'stockSymbol',
        'quantity',
        'averagePrice',
        'currentPrice',
        'marketValue',
        'dpId',
        'clientId',
        'brokerName',
        'lastTradedDate'
      ],
      supportedFIPs: ['NSDL', 'CDSL', 'Zerodha', 'Upstox'],
      retentionPeriod: 180,
      refreshFrequency: 'REALTIME'
    },
    
    EPF: {
      code: 'EPF',
      name: 'Employee Provident Fund',
      description: 'EPF account details, contributions, balance',
      dataPoints: [
        'epfAccountNumber',
        'uanNumber',
        'employerName',
        'totalBalance',
        'employeeContribution',
        'employerContribution',
        'interestEarned',
        'lastContributionDate',
        'accountStatus'
      ],
      supportedFIPs: ['EPFO'],
      retentionPeriod: 180,
      refreshFrequency: 'MONTHLY'
    },
    
    PPF: {
      code: 'PPF',
      name: 'Public Provident Fund',
      description: 'PPF account details, contributions, balance',
      dataPoints: [
        'ppfAccountNumber',
        'totalBalance',
        'totalContribution',
        'interestEarned',
        'maturityDate',
        'lastContributionDate',
        'accountStatus',
        'branchName'
      ],
      supportedFIPs: ['SBI', 'HDFC', 'ICICI'],
      retentionPeriod: 180,
      refreshFrequency: 'MONTHLY'
    },
    
    NPS: {
      code: 'NPS',
      name: 'National Pension System',
      description: 'NPS account details, contributions, NAV',
      dataPoints: [
        'pranNumber',
        'totalBalance',
        'totalContribution',
        'currentNav',
        'fundManager',
        'schemeDetails',
        'lastContributionDate',
        'accountStatus'
      ],
      supportedFIPs: ['NSDL', 'Karvy'],
      retentionPeriod: 180,
      refreshFrequency: 'DAILY'
    },
    
    GOLD: {
      code: 'GOLD',
      name: 'Gold Investments',
      description: 'Sovereign Gold Bonds, digital gold, physical gold',
      dataPoints: [
        'goldType',
        'quantity',
        'currentValue',
        'purchasePrice',
        'purchaseDate',
        'issuerName',
        'bondNumber',
        'maturityDate'
      ],
      supportedFIPs: ['RBI', 'SBI', 'HDFC'],
      retentionPeriod: 180,
      refreshFrequency: 'DAILY'
    },
    
    FIXED_DEPOSITS: {
      code: 'FIXED_DEPOSITS',
      name: 'Fixed Deposits',
      description: 'Fixed deposit accounts, maturity details, interest rates',
      dataPoints: [
        'fdNumber',
        'principalAmount',
        'interestRate',
        'maturityDate',
        'maturityAmount',
        'interestEarned',
        'bankName',
        'accountStatus',
        'autoRenewal'
      ],
      supportedFIPs: ['HDFC', 'ICICI', 'SBI', 'Axis'],
      retentionPeriod: 180,
      refreshFrequency: 'MONTHLY'
    },
    
    RECURRING_DEPOSITS: {
      code: 'RECURRING_DEPOSITS',
      name: 'Recurring Deposits',
      description: 'Recurring deposit accounts, monthly contributions',
      dataPoints: [
        'rdNumber',
        'monthlyAmount',
        'totalContribution',
        'interestRate',
        'maturityDate',
        'maturityAmount',
        'bankName',
        'accountStatus'
      ],
      supportedFIPs: ['HDFC', 'ICICI', 'SBI', 'Axis'],
      retentionPeriod: 180,
      refreshFrequency: 'MONTHLY'
    }
  },

  // Data Access Modes
  DATA_ACCESS_MODES: {
    VIEW: {
      code: 'VIEW',
      name: 'View Only',
      description: 'Data can only be viewed, not stored',
      retentionPeriod: 0,
      useCase: 'One-time data viewing',
      compliance: 'Minimal storage requirements'
    },
    
    STORE: {
      code: 'STORE',
      name: 'Store and Process',
      description: 'Data can be stored and processed',
      retentionPeriod: 180,
      useCase: 'Financial analysis, portfolio management',
      compliance: 'Full data lifecycle management required'
    },
    
    QUERY: {
      code: 'QUERY',
      name: 'Query Based',
      description: 'Data accessed on-demand through queries',
      retentionPeriod: 30,
      useCase: 'Ad-hoc financial queries',
      compliance: 'Limited storage with query logging'
    },
    
    STREAM: {
      code: 'STREAM',
      name: 'Real-time Streaming',
      description: 'Real-time data streaming',
      retentionPeriod: 7,
      useCase: 'Real-time monitoring, alerts',
      compliance: 'Real-time processing with minimal storage'
    }
  },

  // Transaction Data Granularity
  TRANSACTION_DATA: {
    BASIC: [
      'transactionId',
      'amount',
      'transactionType',
      'transactionDate',
      'description',
      'balance'
    ],
    
    DETAILED: [
      'transactionId',
      'amount',
      'transactionType',
      'transactionDate',
      'description',
      'balance',
      'category',
      'merchantName',
      'referenceNumber',
      'currency',
      'transactionMode',
      'upiId',
      'chequeNumber',
      'narration',
      'location',
      'deviceId'
    ],
    
    ENHANCED: [
      'transactionId',
      'amount',
      'transactionType',
      'transactionDate',
      'description',
      'balance',
      'category',
      'merchantName',
      'referenceNumber',
      'currency',
      'transactionMode',
      'upiId',
      'chequeNumber',
      'narration',
      'location',
      'deviceId',
      'merchantCategoryCode',
      'merchantId',
      'terminalId',
      'authorizationCode',
      'cardLastFourDigits',
      'cardType',
      'internationalTransaction',
      'cashbackEarned',
      'rewardPoints'
    ]
  },

  // Account Level Data
  ACCOUNT_DATA: {
    BASIC: [
      'accountId',
      'accountName',
      'accountNumber',
      'bankName',
      'accountType',
      'balance',
      'status'
    ],
    
    DETAILED: [
      'accountId',
      'accountName',
      'accountNumber',
      'bankName',
      'accountType',
      'balance',
      'status',
      'currency',
      'ifscCode',
      'branchName',
      'accountHolderName',
      'maskedAccountNumber',
      'lastTransactionDate',
      'averageBalance'
    ],
    
    ENHANCED: [
      'accountId',
      'accountName',
      'accountNumber',
      'bankName',
      'accountType',
      'balance',
      'status',
      'currency',
      'ifscCode',
      'branchName',
      'accountHolderName',
      'maskedAccountNumber',
      'lastTransactionDate',
      'averageBalance',
      'interestRate',
      'minimumBalance',
      'overdraftLimit',
      'accountOpeningDate',
      'kycStatus',
      'nomineeDetails',
      'jointHolderDetails',
      'accountFeatures'
    ]
  },

  // Profile and Summary Data
  PROFILE_DATA: {
    BASIC: [
      'customerId',
      'name',
      'email',
      'phone',
      'dateOfBirth',
      'panNumber'
    ],
    
    DETAILED: [
      'customerId',
      'name',
      'email',
      'phone',
      'dateOfBirth',
      'panNumber',
      'aadhaarNumber',
      'address',
      'occupation',
      'incomeRange',
      'kycStatus',
      'riskProfile'
    ],
    
    ENHANCED: [
      'customerId',
      'name',
      'email',
      'phone',
      'dateOfBirth',
      'panNumber',
      'aadhaarNumber',
      'address',
      'occupation',
      'incomeRange',
      'kycStatus',
      'riskProfile',
      'preferredLanguage',
      'communicationPreferences',
      'emergencyContact',
      'nomineeDetails',
      'taxResidency',
      'fatcaStatus'
    ]
  },

  // Summary Data
  SUMMARY_DATA: {
    ACCOUNT_SUMMARY: [
      'totalAccounts',
      'activeAccounts',
      'totalBalance',
      'averageBalance',
      'accountTypes',
      'banks'
    ],
    
    TRANSACTION_SUMMARY: [
      'totalTransactions',
      'totalCredit',
      'totalDebit',
      'averageAmount',
      'transactionCategories',
      'monthlyTrends'
    ],
    
    INVESTMENT_SUMMARY: [
      'totalInvestments',
      'investmentTypes',
      'currentValue',
      'totalGain',
      'assetAllocation',
      'riskMetrics'
    ]
  }
};

// Helper functions
export const getFiTypeDetails = (fiType: string) => {
  return FINANCIAL_DATA_TYPES.FI_TYPES[fiType as keyof typeof FINANCIAL_DATA_TYPES.FI_TYPES];
};

export const getDataAccessModeDetails = (mode: string) => {
  return FINANCIAL_DATA_TYPES.DATA_ACCESS_MODES[mode as keyof typeof FINANCIAL_DATA_TYPES.DATA_ACCESS_MODES];
};

export const getAllSupportedFiTypes = () => {
  return Object.keys(FINANCIAL_DATA_TYPES.FI_TYPES);
};

export const getFiTypesByCategory = (category: string) => {
  const categories = {
    banking: ['DEPOSIT', 'FIXED_DEPOSITS', 'RECURRING_DEPOSITS'],
    investments: ['MUTUAL_FUNDS', 'EQUITIES', 'GOLD'],
    insurance: ['INSURANCE_POLICIES'],
    retirement: ['EPF', 'PPF', 'NPS']
  };
  return categories[category as keyof typeof categories] || [];
};

export const getRetentionPeriod = (fiType: string) => {
  const fiTypeDetails = getFiTypeDetails(fiType);
  return fiTypeDetails?.retentionPeriod || 180;
};

export const getRefreshFrequency = (fiType: string) => {
  const fiTypeDetails = getFiTypeDetails(fiType);
  return fiTypeDetails?.refreshFrequency || 'DAILY';
};
