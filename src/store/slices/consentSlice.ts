import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Consent } from '../../types/consent';

interface ConsentState {
  consents: Consent[];
  loading: boolean;
  error: string | null;
}

const initialState: ConsentState = {
  consents: [],
  loading: false,
  error: null,
};

const consentSlice = createSlice({
  name: 'consent',
  initialState,
  reducers: {
    setConsents: (state, action: PayloadAction<Consent[]>) => {
      state.consents = action.payload;
      state.loading = false;
      state.error = null;
    },
    addConsent: (state, action: PayloadAction<Consent>) => {
      state.consents.push(action.payload);
      state.error = null;
    },
    updateConsent: (state, action: PayloadAction<{ consentId: string; [key: string]: any }>) => {
      const { consentId, ...updates } = action.payload;
      const consentIndex = state.consents.findIndex(c => c.consentId === consentId);
      if (consentIndex !== -1) {
        state.consents[consentIndex] = { ...state.consents[consentIndex], ...updates };
      }
    },
    removeConsent: (state, action: PayloadAction<string>) => {
      state.consents = state.consents.filter(c => c.consentId !== action.payload);
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
  setConsents,
  addConsent,
  updateConsent,
  removeConsent,
  setLoading,
  setError,
  clearError,
} = consentSlice.actions;

export default consentSlice.reducer; 