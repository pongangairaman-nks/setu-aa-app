import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './WebViewScreen.styles';
import { CustomWebView } from '../../components/common/CustomWebView/CustomWebView';
import { WebViewNavigation } from 'react-native-webview';

interface WebViewScreenParams {
  uri: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const WebViewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uri, onSuccess, onError } = route.params as WebViewScreenParams;

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    console.log('🔄 WebView navigation state changed:', navState.url);
    
    // Handle Setu callback URLs - check for consent-callback deep link
    if (navState.url.includes('setu-aa-app://consent-callback')) {
      console.log('📱 Detected consent callback deep link');
      
      try {
        // Extract parameters from the deep link URL
        const urlParts = navState.url.split('?');
        if (urlParts.length > 1) {
          const urlParams = new URLSearchParams(urlParts[1]);
          const consentId = urlParams.get('consentId');
          const status = urlParams.get('status');
          const error = urlParams.get('error');
          
          console.log('📋 Extracted parameters:', { consentId, status, error });
          
          if (consentId && consentId.length > 0) {
            // Success case - we have a consent ID
            const successData = {
              consentId: consentId,
              status: status || 'ACTIVE',
            };
            
            console.log('✅ Success data:', successData);
            onSuccess?.(successData);
            navigation.goBack();
          } else if (error && error.length > 0) {
            // Error case - we have an error
            const errorData = {
              error: error,
              errorDescription: urlParams.get('errorDescription') || 'Unknown error',
            };
            
            console.log('❌ Error data:', errorData);
            onError?.(errorData);
            navigation.goBack();
          } else {
            // Unknown case - no consent ID or error
            console.log('⚠️ Unknown callback state - no consent ID or error');
            const errorData = {
              error: 'unknown_status',
              errorDescription: 'Unknown callback status',
            };
            onError?.(errorData);
            navigation.goBack();
          }
        } else {
          console.log('⚠️ No query parameters in callback URL');
          const errorData = {
            error: 'no_parameters',
            errorDescription: 'No parameters in callback URL',
          };
          onError?.(errorData);
          navigation.goBack();
        }
      } catch (error) {
        console.error('❌ Error parsing callback URL:', error);
        const errorData = {
          error: 'parse_error',
          errorDescription: 'Failed to parse callback URL',
        };
        onError?.(errorData);
        navigation.goBack();
      }
    }
    // Keep the old handlers for backward compatibility
    else if (navState.url.includes('success')) {
      // Extract success data from URL
      const urlParams = new URLSearchParams(navState.url.split('?')[1]);
      const successData = {
        consentId: urlParams.get('consentId'),
        status: urlParams.get('status'),
      };
      
      onSuccess?.(successData);
      navigation.goBack();
    } else if (navState.url.includes('error')) {
      // Extract error data from URL
      const urlParams = new URLSearchParams(navState.url.split('?')[1]);
      const errorData = {
        error: urlParams.get('error'),
        errorDescription: urlParams.get('error_description'),
      };
      
      onError?.(errorData);
      navigation.goBack();
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'SUCCESS') {
        onSuccess?.(data.payload);
        navigation.goBack();
      } else if (data.type === 'ERROR') {
        onError?.(data.payload);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleError = (error: any) => {
    console.error('WebView error:', error);
    Alert.alert('Error', 'Failed to load the page. Please try again.');
    navigation.goBack();
  };

  useEffect(() => {
    if (!uri) {
      Alert.alert('Error', 'No URL provided.');
      navigation.goBack();
    }
  }, [uri, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <CustomWebView
        uri={uri}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleError}
      />
    </SafeAreaView>
  );
}; 