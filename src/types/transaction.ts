export interface Transaction {
  transactionId: string;
  accountId: string;
  accountNumber: string;
  description: string;
  amount: number;
  transactionType: 'CREDIT' | 'DEBIT';
  transactionDate: string;
  balance: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED';
  category?: string;
  merchantName?: string;
  referenceNumber?: string;
  currency?: string;
  transactionMode?: string;
  upiId?: string;
  chequeNumber?: string;
  narration?: string;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
  currency: string;
  period: {
    from: string;
    to: string;
  };
}

export interface TransactionFilter {
  accountId?: string;
  transactionType?: 'CREDIT' | 'DEBIT';
  status?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  merchantName?: string;
}

export interface TransactionCategory {
  name: string;
  count: number;
  totalAmount: number;
  type: 'CREDIT' | 'DEBIT';
} 