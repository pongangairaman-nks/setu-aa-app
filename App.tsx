import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as Linking from 'expo-linking';
import { useDispatch } from 'react-redux';
import { updateConsent } from './src/store/slices/consentSlice';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationRef';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle deep links when app is already running
    const handleDeepLink = (event: { url: string }) => {
      handleConsentCallback(event.url);
    };

    // Handle deep links when app is opened from a link
    const handleInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleConsentCallback(initialURL);
      }
    };

    // Set up listeners
    const subscription = Linking.addEventListener('url', handleDeepLink);
    handleInitialURL();

    return () => {
      // Clean up listener
      subscription?.remove();
    };
  }, []);

  const handleConsentCallback = (url: string) => {
    try {
      console.log('🔗 Handling deep link:', url);
      
      // Parse the URL
      const parsedUrl = Linking.parse(url);
      
      // Check if this is a Setu consent callback
      if (parsedUrl.path === 'consent-callback' || url.includes('consent-callback')) {
        const { consentId, status, error, error_code, error_message } = parsedUrl.queryParams || {};
        
        console.log('📱 Consent callback received:', { consentId, status, error, error_code, error_message });
        
        if (consentId) {
          // Update consent status in Redux store
          dispatch(updateConsent({
            consentId: consentId as string,
            status: status as string || 'PENDING',
            error: error as string || error_code as string || null,
            errorMessage: error_message as string || null
          }));

          // Navigate to ConsentCallbackScreen
          if (navigationRef.isReady()) {
            navigationRef.dispatch(
              CommonActions.navigate({
                name: 'ConsentCallback',
                params: {
                  consentId: consentId as string,
                  status: status as string || 'PENDING',
                  error: error as string || error_code as string || null,
                  errorMessage: error_message as string || null
                }
              })
            );
          }
          console.log('✅ Consent callback processed successfully');
        }
      } else if (url.includes('success')) {
        // Handle success callback from Setu
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const consentId = urlParams.get('consentId');
        const status = urlParams.get('status') || 'ACTIVE';
        
        if (consentId) {
          dispatch(updateConsent({
            consentId,
            status,
            error: null
          }));
          
          // Navigate to ConsentCallbackScreen
          if (navigationRef.isReady()) {
            navigationRef.dispatch(
              CommonActions.navigate({
                name: 'ConsentCallback',
                params: {
                  consentId,
                  status,
                  error: null
                }
              })
            );
          }
        }
      } else if (url.includes('error')) {
        // Handle error callback from Setu
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const consentId = urlParams.get('consentId');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (consentId) {
          dispatch(updateConsent({
            consentId,
            status: 'REJECTED',
            error: error || 'Unknown error',
            errorMessage: errorDescription || null
          }));
          
          // Navigate to ConsentCallbackScreen
          if (navigationRef.isReady()) {
            navigationRef.dispatch(
              CommonActions.navigate({
                name: 'ConsentCallback',
                params: {
                  consentId,
                  status: 'REJECTED',
                  error: error || 'Unknown error',
                  errorMessage: errorDescription || null
                }
              })
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
} 