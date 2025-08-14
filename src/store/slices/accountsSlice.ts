import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account } from '../../types/account';

interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  loading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts = action.payload;
      state.loading = false;
      state.error = null;
    },
    addAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts.push(...action.payload);
      state.error = null;
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.accounts.push(action.payload);
      state.error = null;
    },
    updateAccount: (state, action: PayloadAction<{ accountId: string; [key: string]: any }>) => {
      const { accountId, ...updates } = action.payload;
      const accountIndex = state.accounts.findIndex(a => a.accountId === accountId);
      if (accountIndex !== -1) {
        state.accounts[accountIndex] = { ...state.accounts[accountIndex], ...updates };
      }
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter(a => a.accountId !== action.payload);
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
  setAccounts,
  addAccounts,
  addAccount,
  updateAccount,
  removeAccount,
  setLoading,
  setError,
  clearError,
} = accountsSlice.actions;

export default accountsSlice.reducer; 