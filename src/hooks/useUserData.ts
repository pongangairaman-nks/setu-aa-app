import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setuApi } from '../services/api/setuApi';
import { userActions } from '../store';
import { RootState } from '../store';

export interface UserFinancialData {
  consentId: string;
  consentStatus: string;
  profile: any;
  accounts: any[];
  transactions: any[];
  summary: {
    totalAccounts: number;
    totalTransactions: number;
    lastDataFetch: string;
  };
}

export const useUserData = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching user financial data...');
      const response = await setuApi.getUserData();
      
      if (response.success && response.data) {
        const userData: UserFinancialData = response.data;
        
        // Update user state with financial data
        dispatch(userActions.updateUserFinancialData({
          profile: userData.profile,
          accounts: userData.accounts,
          transactions: userData.transactions
        }));
        
        console.log('✅ User data fetched successfully:', {
          accounts: userData.accounts.length,
          transactions: userData.transactions.length
        });
        
        return userData;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
      setError(errorMessage);
      console.error('❌ Error fetching user data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const refreshUserData = useCallback(() => {
    return fetchUserData();
  }, [fetchUserData]);

  // Get accounts from user data
  const getAccounts = useCallback(() => {
    return user?.accounts || [];
  }, [user?.accounts]);

  // Get transactions from user data
  const getTransactions = useCallback(() => {
    return user?.transactions || [];
  }, [user?.transactions]);

  // Get profile from user data
  const getProfile = useCallback(() => {
    return user?.profile || null;
  }, [user?.profile]);

  // Get transactions for a specific account
  const getTransactionsByAccount = useCallback((linkRefNumber: string) => {
    return user?.transactions?.filter(txn => txn.linkRefNumber === linkRefNumber) || [];
  }, [user?.transactions]);

  // Get account by link reference number
  const getAccountByLinkRef = useCallback((linkRefNumber: string) => {
    return user?.accounts?.find(acc => acc.linkRefNumber === linkRefNumber) || null;
  }, [user?.accounts]);

  // Get summary statistics
  const getSummary = useCallback(() => {
    const accounts = user?.accounts || [];
    const transactions = user?.transactions || [];
    
    return {
      totalAccounts: accounts.length,
      totalTransactions: transactions.length,
      totalBalance: accounts.reduce((sum, acc) => sum + (acc.summary?.currentBalance || 0), 0),
      lastDataFetch: user?.consentDetails?.consentUpdatedAt
    };
  }, [user?.accounts, user?.transactions, user?.consentDetails?.consentUpdatedAt]);

  useEffect(() => {
    // Fetch user data on mount if user is logged in
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id, fetchUserData]);

  return {
    // Data
    userData: user,
    accounts: getAccounts(),
    transactions: getTransactions(),
    profile: getProfile(),
    summary: getSummary(),
    
    // State
    loading,
    error,
    
    // Actions
    fetchUserData,
    refreshUserData,
    getTransactionsByAccount,
    getAccountByLinkRef,
    
    // Utilities
    hasData: (user?.accounts?.length || 0) > 0 || (user?.transactions?.length || 0) > 0,
    hasAccounts: (user?.accounts?.length || 0) > 0,
    hasTransactions: (user?.transactions?.length || 0) > 0,
  };
};
