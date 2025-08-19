// Consent API Types - Updated to match Setu API requirements
export interface ConsentRequest {
  // Mandatory fields as per Setu documentation
  consentDuration?: {
    unit: 'MONTH' | 'YEAR' | 'DAY';
    value: string;
  };
  consentDateRange?: {
    startDate: string;
    endDate: string;
  };
  consentMode: 'VIEW' | 'STORE' | 'QUERY' | 'STREAM';
  fetchType: 'ONETIME' | 'PERIODIC';
  consentTypes: Array<'PROFILE' | 'SUMMARY' | 'TRANSACTIONS'>;
  fiTypes: Array<'DEPOSIT' | 'MUTUAL_FUNDS' | 'INSURANCE_POLICIES' | 'TERM_DEPOSIT' | 'RECURRING_DEPOSIT' | 'SIP' | 'GOVT_SECURITIES' | 'EQUITIES' | 'BONDS' | 'DEBENTURES' | 'ETF'>;
  vua: string; // Virtual user address - mobile number or mobile@handle
  purpose: {
    code: '101' | '102' | '103' | '104' | '105';
    refUri: string;
    text: string;
    category?: {
      type: string;
    };
  };
  dataLife: {
    unit: 'MONTH' | 'YEAR' | 'DAY' | 'INF';
    value: number;
  };
  frequency: {
    unit: 'HOURLY' | 'DAILY' | 'MONTHLY' | 'YEARLY';
    value: number;
  };
  redirectUrl: string;
  
  // Optional fields
  dataRange?: {
    from: string;
    to: string;
  };
  dataFilter?: Array<{
    type: string;
    operator: '>' | '<' | '<=' | '>=';
    value: number;
  }>;
  context?: Array<{
    key: string;
    value: string;
  }>;
  additionalParams?: {
    tags?: string[];
  };
  enableAdditionalPhoneNumber?: boolean;
}

// Sandbox API Consent Request Type (simpler format)
export interface SandboxConsentRequest {
  consentDuration: {
    unit: 'MONTH' | 'YEAR' | 'DAY';
    value: string;
  };
  vua: string;
  dataRange: {
    from: string;
    to: string;
  };
  consentTypes: Array<'PROFILE' | 'SUMMARY' | 'TRANSACTIONS'>;
  context: Array<any>;
}

export interface ConsentResponse {
  id: string;
  url: string;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'REJECTED';
  detail?: {
    consentStart: string;
    consentExpiry: string;
    fiTypes: string[];
    fetchType: string;
    purpose: {
      category: {
        type: string;
      };
      refUri: string;
      code: string;
      text: string;
    };
    vua: string;
    dataRange?: {
      from: string;
      to: string;
    };
    consentTypes: string[];
    consentMode: string;
    frequency: {
      value: number;
      unit: string;
    };
    dataLife: {
      value: number;
      unit: string;
    };
  };
  redirectUrl?: string;
  context: any[];
  usage?: {
    count: string;
    lastUsed: string | null;
  };
  tags?: string[];
  traceId: string;
  accountsLinked?: any[];
}

// Data Fetching API Types
export interface FetchDataRequest {
  consentId: string;
  dataRange: {
    from: string;
    to: string;
  };
  accountId?: string;
}

export interface AccountResponse {
  accounts: Array<{
    accountId: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    accountType: string;
    balance: number;
    status: string;
  }>;
  status: string;
  message?: string;
}

export interface TransactionResponse {
  transactions: Array<{
    transactionId: string;
    accountId: string;
    accountNumber: string;
    description: string;
    amount: number;
    transactionType: 'CREDIT' | 'DEBIT';
    transactionDate: string;
    balance: number;
    status: string;
    category?: string;
    merchantName?: string;
    referenceNumber?: string;
  }>;
  status: string;
  message?: string;
}

// Webhook Types
export interface WebhookPayload {
  type: 'CONSENT_STATUS_UPDATE' | 'DATA_FETCH_COMPLETE' | 'DATA_FETCH_FAILED';
  consentId?: string;
  status?: string;
  data?: any;
  timestamp: string;
  signature?: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Data Session Types
export interface DataSessionRequest {
  consentId: string;
  dataRange: {
    from: string;
    to: string;
  };
  format: 'json' | 'xml';
}

export interface DataSessionResponse {
  format: 'json' | 'xml';
  fips: any[] | null;
  dataRange: {
    to: string;
    from: string;
  };
  id: string;
  status: 'PENDING' | 'READY' | 'FAILED';
  consentId: string;
  traceId: string;
}

export interface FIDataResponse {
  sessionId: string;
  data: any;
  status: string;
  traceId: string;
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
} 