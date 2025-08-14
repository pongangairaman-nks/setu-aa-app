import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setuApi } from '../services/api/setuApi';
import { transactionsActions } from '../store';
import { RootState } from '../store';
import { Transaction } from '../types/transaction';

export const useTransactions = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector((state: RootState) => state.transactions);

  const fetchTransactions = useCallback(async (accountId: string, consentId: string) => {
    try {
      dispatch(transactionsActions.clearError());
      dispatch(transactionsActions.setLoading(true));
      const response = await setuApi.fetchTransactions({
        accountId,
        consentId,
        dataRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          to: new Date().toISOString(),
        },
      });

      const transactionList: Transaction[] = response.transactions?.map((txn: any) => ({
        transactionId: txn.transactionId,
        accountId: txn.accountId,
        accountNumber: txn.accountNumber || '',
        description: txn.description,
        amount: txn.amount,
        transactionType: txn.transactionType,
        transactionDate: txn.transactionDate,
        balance: txn.balance,
        status: txn.status,
        category: txn.category,
        merchantName: txn.merchantName,
        referenceNumber: txn.referenceNumber,
        lastUpdated: new Date().toISOString(),
      })) || [];

      dispatch(transactionsActions.setTransactions(transactionList));
      await storeTransactions(transactionList);
      return transactionList;
    } catch (err) {
      dispatch(transactionsActions.setError('Failed to fetch transactions'));
      console.error('Error fetching transactions:', err);
      throw err;
    } finally {
      dispatch(transactionsActions.setLoading(false));
    }
  }, [dispatch]);

  const refreshTransactions = useCallback(() => {
    // This would typically refresh from stored data or re-fetch from API
    console.log('Refreshing transactions...');
  }, []);

  const getTransactionById = useCallback((transactionId: string) => {
    return transactions.find(transaction => transaction.transactionId === transactionId);
  }, [transactions]);

  const getTransactionsByAccount = useCallback((accountId: string) => {
    return transactions.filter(transaction => transaction.accountId === accountId);
  }, [transactions]);

  const getTransactionsByDateRange = useCallback((from: string, to: string) => {
    return transactions.filter(transaction => {
      const txDate = new Date(transaction.transactionDate);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return txDate >= fromDate && txDate <= toDate;
    });
  }, [transactions]);

  const getTransactionsByType = useCallback((type: 'CREDIT' | 'DEBIT') => {
    return transactions.filter(transaction => transaction.transactionType === type);
  }, [transactions]);

  const getTransactionsByCategory = useCallback((category: string) => {
    return transactions.filter(transaction => transaction.category === category);
  }, [transactions]);

  const getTransactionSummary = useCallback(() => {
    const totalCredit = transactions
      .filter(t => t.transactionType === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDebit = transactions
      .filter(t => t.transactionType === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalCredit,
      totalDebit,
      netAmount: totalCredit - totalDebit,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  useEffect(() => {
    // Load stored transactions on mount
    loadStoredTransactions();
  }, []);

  const loadStoredTransactions = async () => {
    try {
      const storedTransactions = await getStoredTransactions();
      if (storedTransactions.length > 0) {
        dispatch(transactionsActions.setTransactions(storedTransactions));
      }
    } catch (err) {
      console.error('Error loading stored transactions:', err);
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    refreshTransactions,
    getTransactionById,
    getTransactionsByAccount,
    getTransactionsByDateRange,
    getTransactionsByType,
    getTransactionsByCategory,
    getTransactionSummary,
  };
};

// Helper functions for local storage (replace with your actual storage implementation)
const getStoredTransactions = async (): Promise<Transaction[]> => {
  // This would typically fetch from AsyncStorage or your backend
  return [];
};

const storeTransactions = async (transactions: Transaction[]): Promise<void> => {
  // This would typically store in AsyncStorage or your backend
  console.log('Storing transactions:', transactions);
}; 