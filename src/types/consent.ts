export interface Consent {
  consentId: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REJECTED';
  fipName: string;
  dataLife: number;
  permissions: string[];
  createdAt: string;
  expiresAt: string;
  lastUpdated?: string;
  consentUrl?: string;
  fipId?: string;
  fetchType?: 'PERIODIC' | 'ONETIME';
  frequency?: {
    unit: 'MONTH' | 'DAY' | 'WEEK';
    value: number;
  };
}

export interface ConsentRequest {
  fipId: string;
  dataLife: number;
  permissions: string[];
  fetchType: 'PERIODIC' | 'ONETIME';
  frequency?: {
    unit: 'MONTH' | 'DAY' | 'WEEK';
    value: number;
  };
  fipName?: string;
}

export interface ConsentStatus {
  consentId: string;
  status: string;
  lastUpdated: string;
}

export interface ConsentFilter {
  status?: string;
  fipName?: string;
  createdAfter?: string;
  createdBefore?: string;
  expiresAfter?: string;
  expiresBefore?: string;
} 