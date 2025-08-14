import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setuApi } from '../services/api/setuApi';
import { consentActions } from '../store';
import { RootState } from '../store';
import { Consent } from '../types/consent';

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

  const createConsent = useCallback(async (consentData: any) => {
    try {
      dispatch(consentActions.clearError());
      dispatch(consentActions.setLoading(true));
      const response = await setuApi.createConsentRequest(consentData);
      
      const newConsent: Consent = {
        consentId: response.consentId,
        status: 'PENDING',
        fipName: consentData.fipName || 'Unknown FIP',
        dataLife: consentData.dataLife || 30,
        permissions: consentData.permissions || [],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (consentData.dataLife || 30) * 24 * 60 * 60 * 1000).toISOString(),
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
      await setuApi.revokeConsentRequest(consentId);
      
      dispatch(consentActions.updateConsent({ consentId, status: 'REVOKED' }));
      await updateStoredConsent(consentId, { status: 'REVOKED' });
    } catch (err) {
      dispatch(consentActions.setError('Failed to revoke consent'));
      console.error('Error revoking consent:', err);
      throw err;
    } finally {
      dispatch(consentActions.setLoading(false));
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