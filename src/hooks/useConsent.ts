import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setuApi } from '../services/api/setuApi';
import { consentActions } from '../store';
import { RootState } from '../store';
import { Consent } from '../types/consent';
import { ConsentRequest } from '../types/api';

export const useConsent = () => {
  const dispatch = useDispatch();
  const { consents, loading, error } = useSelector((state: RootState) => state.consent);

  const fetchConsents = useCallback(async () => {
    try {
      dispatch(consentActions.clearError());
      dispatch(consentActions.setLoading(true));
      // This would typically fetch from your backend that stores consents
      // For now, we'll use mock data or stored consents
      const storedConsents = await getStoredConsents();
      dispatch(consentActions.setConsents(storedConsents));
    } catch (err) {
      dispatch(consentActions.setError('Failed to fetch consents'));
      console.error('Error fetching consents:', err);
    } finally {
      dispatch(consentActions.setLoading(false));
    }
  }, [dispatch]);

  const createConsent = useCallback(async (consentData: ConsentRequest) => {
    try {
      dispatch(consentActions.clearError());
      dispatch(consentActions.setLoading(true));
      
      // Create a proper Setu consent request
      const setuConsentRequest: ConsentRequest = {
        consentDuration: {
          unit: 'MONTH',
          value: '4'
        },
        vua: consentData.vua || '999999999', // Default test mobile number
        dataRange: {
          from: '2020-04-01T00:00:00Z',
          to: '2023-01-01T00:00:00Z'
        },
        context: [],
        additionalParams: {
          tags: ['Loan_Tracking', 'Partner_X']
        },
        // Required fields
        consentMode: 'STORE',
        fetchType: 'PERIODIC',
        consentTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY'],
        fiTypes: ['DEPOSIT'],
        purpose: {
          code: '101',
          refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
          text: 'Loan underwriting'
        },
        dataLife: {
          unit: 'MONTH',
          value: 1
        },
        frequency: {
          unit: 'MONTHLY',
          value: 1
        },
        redirectUrl: 'https://hedgrpay.com/api/consents/callback'
      };

      const response = await setuApi.createConsentRequest(setuConsentRequest);
      
      const newConsent: Consent = {
        consentId: response.id, // Setu API returns 'id' not 'consentId'
        status: response.status,
        fipName: 'Setu FIP', // Default FIP name
        dataLife: 30,
        permissions: ['ACCOUNT', 'TRANSACTIONS'],
        createdAt: new Date().toISOString(),
        expiresAt: response.detail?.consentExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        consentUrl: response.url, // Setu API returns 'url' for consent approval
      };

      dispatch(consentActions.addConsent(newConsent));
      await storeConsent(newConsent);
      return response;
    } catch (err) {
      dispatch(consentActions.setError('Failed to create consent'));
      console.error('Error creating consent:', err);
      throw err;
    } finally {
      dispatch(consentActions.setLoading(false));
    }
  }, [dispatch]);

  const revokeConsent = useCallback(async (consentId: string) => {
    try {
      dispatch(consentActions.clearError());
      dispatch(consentActions.setLoading(true));
      const response = await setuApi.revokeConsentRequest(consentId);
      
      dispatch(consentActions.updateConsent({ consentId, status: response.status }));
      await updateStoredConsent(consentId, { status: response.status });
    } catch (err) {
      dispatch(consentActions.setError('Failed to revoke consent'));
      console.error('Error revoking consent:', err);
      throw err;
    } finally {
      dispatch(consentActions.setLoading(false));
    }
  }, [dispatch]);

  const getConsentStatus = useCallback(async (consentId: string) => {
    try {
      const response = await setuApi.getConsentStatus(consentId);
      dispatch(consentActions.updateConsent({ 
        consentId, 
        status: response.status 
      }));
      return response;
    } catch (err) {
      console.error('Error getting consent status:', err);
      throw err;
    }
  }, [dispatch]);

  const refreshConsents = useCallback(() => {
    fetchConsents();
  }, [fetchConsents]);

  const getConsentById = useCallback((consentId: string) => {
    return consents.find(consent => consent.consentId === consentId);
  }, [consents]);

  const getActiveConsents = useCallback(() => {
    return consents.filter(consent => consent.status === 'ACTIVE');
  }, [consents]);

  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  return {
    consents,
    loading,
    error,
    fetchConsents,
    createConsent,
    revokeConsent,
    getConsentStatus,
    refreshConsents,
    getConsentById,
    getActiveConsents,
  };
};

// Helper functions for local storage (replace with your actual storage implementation)
const getStoredConsents = async (): Promise<Consent[]> => {
  // This would typically fetch from AsyncStorage or your backend
  return [];
};

const storeConsent = async (consent: Consent): Promise<void> => {
  // This would typically store in AsyncStorage or your backend
  console.log('Storing consent:', consent);
};

const updateStoredConsent = async (consentId: string, updates: Partial<Consent>): Promise<void> => {
  // This would typically update in AsyncStorage or your backend
  console.log('Updating consent:', consentId, updates);
}; 