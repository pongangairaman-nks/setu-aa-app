import { configureStore } from '@reduxjs/toolkit';
import consentReducer from './slices/consentSlice';
import accountsReducer from './slices/accountsSlice';
import userReducer from './slices/userSlice';
import transactionsReducer from './slices/transactionsSlice';

export const store = configureStore({
  reducer: {
    consent: consentReducer,
    accounts: accountsReducer,
    user: userReducer,
    transactions: transactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 