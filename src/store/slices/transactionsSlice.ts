import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../types/transaction';

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  loading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions.push(...action.payload);
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
      state.error = null;
    },
    updateTransaction: (state, action: PayloadAction<{ transactionId: string; [key: string]: any }>) => {
      const { transactionId, ...updates } = action.payload;
      const transactionIndex = state.transactions.findIndex(t => t.transactionId === transactionId);
      if (transactionIndex !== -1) {
        state.transactions[transactionIndex] = { ...state.transactions[transactionIndex], ...updates };
      }
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.transactionId !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setTransactions,
  addTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  setLoading,
  setError,
  clearError,
} = transactionsSlice.actions;

export default transactionsSlice.reducer; 