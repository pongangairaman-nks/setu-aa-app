export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export all slice actions with aliases to avoid naming conflicts
export * as consentActions from './slices/consentSlice';
export * as accountsActions from './slices/accountsSlice';
export * as userActions from './slices/userSlice';
export * as transactionsActions from './slices/transactionsSlice'; 