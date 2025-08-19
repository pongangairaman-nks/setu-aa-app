import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { setuApi } from '../services/api/setuApi';
import { DataSessionRequest, DataSessionResponse, FIDataResponse } from '../types/api';

export const useDataSession = () => {
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<DataSessionResponse | null>(null);
  const [fiData, setFiData] = useState<FIDataResponse | null>(null);

  const createDataSession = useCallback(async (
    consentId: string,
    dataRange: { from: string; to: string },
    format: 'json' | 'xml' = 'json'
  ): Promise<DataSessionResponse | null> => {
    try {
      setLoading(true);
      console.log('📊 Creating data session for consent:', consentId);
      
      const session = await setuApi.createDataSession(consentId, dataRange, format);
      console.log('✅ Data session created successfully:', session);
      
      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error('❌ Error creating data session:', error);
      Alert.alert(
        '❌ Data Session Creation Failed',
        'Failed to create data session. Please try again later.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDataSession = useCallback(async (sessionId: string): Promise<DataSessionResponse | null> => {
    try {
      setLoading(true);
      console.log('📊 Getting data session:', sessionId);
      
      const session = await setuApi.getDataSession(sessionId);
      console.log('✅ Data session retrieved successfully:', session);
      
      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error('❌ Error getting data session:', error);
      Alert.alert(
        '❌ Data Session Retrieval Failed',
        'Failed to get data session. Please try again later.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFIData = useCallback(async (sessionId: string): Promise<FIDataResponse | null> => {
    try {
      setLoading(true);
      console.log('📊 Fetching FI data for session:', sessionId);
      
      const data = await setuApi.fetchFIData(sessionId);
      console.log('✅ FI data fetched successfully:', data);
      
      setFiData(data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching FI data:', error);
      Alert.alert(
        '❌ FI Data Fetch Failed',
        'Failed to fetch financial data. Please try again later.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSessionStatus = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const session = await setuApi.getDataSession(sessionId);
      setCurrentSession(session);
      
      if (session.status === 'READY') {
        console.log('✅ Data session is ready for data fetch');
        return true;
      } else if (session.status === 'FAILED') {
        console.log('❌ Data session failed');
        Alert.alert(
          '❌ Data Session Failed',
          'The data session has failed. Please try creating a new session.',
          [{ text: 'OK' }]
        );
        return false;
      } else {
        console.log('⏳ Data session is still pending...');
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking session status:', error);
      return false;
    }
  }, []);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setFiData(null);
  }, []);

  return {
    loading,
    currentSession,
    fiData,
    createDataSession,
    getDataSession,
    fetchFIData,
    checkSessionStatus,
    clearSession,
  };
};
