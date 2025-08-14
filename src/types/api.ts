// Consent API Types
export interface ConsentRequest {
  fipId: string;
  dataLife: number;
  permissions: string[];
  fetchType: 'PERIODIC' | 'ONETIME';
  frequency?: {
    unit: 'MONTH' | 'DAY' | 'WEEK';
    value: number;
  };
  dataRange?: {
    from: string;
    to: string;
  };
  fipName?: string;
  redirectUrl?: string;
}

export interface ConsentResponse {
  consentId: string;
  consentUrl: string;
  status: string;
  createdAt: string;
  expiresAt: string;
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
  type: 'CONSENT' | 'DATA';
  data: any;
  timestamp: string;
  signature?: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
} 