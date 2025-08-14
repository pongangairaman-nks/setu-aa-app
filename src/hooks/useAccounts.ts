import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setuApi } from '../services/api/setuApi';
import { accountsActions } from '../store';
import { RootState } from '../store';
import { Account } from '../types/account';

export const useAccounts = () => {
  const dispatch = useDispatch();
  const { accounts, loading, error } = useSelector((state: RootState) => state.accounts);

  const fetchAccounts = useCallback(async (consentId: string) => {
    try {
      dispatch(accountsActions.clearError());
      dispatch(accountsActions.setLoading(true));
      const response = await setuApi.fetchAccounts({
        consentId,
        dataRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          to: new Date().toISOString(),
        },
      });

      const accountList: Account[] = response.accounts?.map((acc: any) => ({
        accountId: acc.accountId,
        accountName: acc.accountName,
        accountNumber: acc.accountNumber,
        bankName: acc.bankName,
        accountType: acc.accountType,
        balance: acc.balance,
        status: acc.status,
        lastUpdated: new Date().toISOString(),
      })) || [];

      dispatch(accountsActions.setAccounts(accountList));
      await storeAccounts(accountList);
      return accountList;
    } catch (err) {
      dispatch(accountsActions.setError('Failed to fetch accounts'));
      console.error('Error fetching accounts:', err);
      throw err;
    } finally {
      dispatch(accountsActions.setLoading(false));
    }
  }, [dispatch]);

  const refreshAccounts = useCallback(() => {
    // This would typically refresh from stored data or re-fetch from API
    console.log('Refreshing accounts...');
  }, []);

  const getAccountById = useCallback((accountId: string) => {
    return accounts.find(account => account.accountId === accountId);
  }, [accounts]);

  const getAccountsByBank = useCallback((bankName: string) => {
    return accounts.filter(account => account.bankName === bankName);
  }, [accounts]);

  const getActiveAccounts = useCallback(() => {
    return accounts.filter(account => account.status === 'ACTIVE');
  }, [accounts]);

  const updateAccountBalance = useCallback(async (accountId: string, balance: number) => {
    try {
      dispatch(accountsActions.updateAccount({ accountId, balance }));
      await updateStoredAccount(accountId, { balance });
    } catch (err) {
      console.error('Error updating account balance:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    // Load stored accounts on mount
    loadStoredAccounts();
  }, []);

  const loadStoredAccounts = async () => {
    try {
      const storedAccounts = await getStoredAccounts();
      if (storedAccounts.length > 0) {
        dispatch(accountsActions.setAccounts(storedAccounts));
      }
    } catch (err) {
      console.error('Error loading stored accounts:', err);
    }
  };

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    refreshAccounts,
    getAccountById,
    getAccountsByBank,
    getActiveAccounts,
    updateAccountBalance,
  };
};

// Helper functions for local storage (replace with your actual storage implementation)
const getStoredAccounts = async (): Promise<Account[]> => {
  // This would typically fetch from AsyncStorage or your backend
  return [];
};

const storeAccounts = async (accounts: Account[]): Promise<void> => {
  // This would typically store in AsyncStorage or your backend
  console.log('Storing accounts:', accounts);
};

const updateStoredAccount = async (accountId: string, updates: Partial<Account>): Promise<void> => {
  // This would typically update in AsyncStorage or your backend
  console.log('Updating account:', accountId, updates);
}; 