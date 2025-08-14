import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as Linking from 'expo-linking';
import { useDispatch } from 'react-redux';
import { updateConsent } from './src/store/slices/consentSlice';

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
      const parsedUrl = Linking.parse(url);
      
      // Check if this is a consent callback
      if (parsedUrl.path === 'consent-callback') {
        const { consentId, status, error } = parsedUrl.queryParams || {};
        
        if (consentId) {
          // Update consent status in Redux store
          dispatch(updateConsent({
            consentId: consentId as string,
            status: status as string || 'PENDING',
            error: error as string || null
          }));
        }
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
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