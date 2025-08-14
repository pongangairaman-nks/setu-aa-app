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
    // Handle Setu callback URLs
    if (navState.url.includes('success')) {
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