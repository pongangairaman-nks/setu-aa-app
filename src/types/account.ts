export interface Account {
  accountId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: string;
  balance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CLOSED';
  lastUpdated: string;
  currency?: string;
  ifscCode?: string;
  branchName?: string;
  accountHolderName?: string;
  maskedAccountNumber?: string;
}

export interface AccountSummary {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  currency: string;
}

export interface AccountFilter {
  bankName?: string;
  accountType?: string;
  status?: string;
  minBalance?: number;
  maxBalance?: number;
} 