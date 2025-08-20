import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../services/auth/authService';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
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
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    updateConsentDetails: (state, action: PayloadAction<{
      consentId: string;
      consentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
      consentCreatedAt?: string;
      consentUpdatedAt?: string;
      consentExpiresAt?: string;
    }>) => {
      if (state.user) {
        state.user.consentDetails = {
          ...state.user.consentDetails,
          ...action.payload,
          consentUpdatedAt: action.payload.consentUpdatedAt || new Date().toISOString()
        };
      }
    },
    updateUserFinancialData: (state, action: PayloadAction<{
      profile?: any;
      accounts?: any[];
      transactions?: any[];
    }>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          profile: action.payload.profile !== undefined ? action.payload.profile : state.user.profile,
          accounts: action.payload.accounts !== undefined ? action.payload.accounts : state.user.accounts,
          transactions: action.payload.transactions !== undefined ? action.payload.transactions : state.user.transactions,
        };
      }
    },
  },
});

export const {
  setUser,
  clearUser,
  updateUser,
  setLoading,
  setError,
  clearError,
  setAuthenticated,
  updateConsentDetails,
  updateUserFinancialData,
} = userSlice.actions;

export default userSlice.reducer; 