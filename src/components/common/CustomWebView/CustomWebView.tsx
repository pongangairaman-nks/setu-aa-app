import React, { useRef, useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { styles } from './CustomWebView.styles';

interface CustomWebViewProps {
  uri: string;
  onNavigationStateChange?: (navState: WebViewNavigation) => void;
  onMessage?: (event: any) => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

export const CustomWebView: React.FC<CustomWebViewProps> = ({
  uri,
  onNavigationStateChange,
  onMessage,
  onError,
  onLoadStart,
  onLoadEnd,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clear any existing timeout when component unmounts or URI changes
  useEffect(() => {
    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, [loadTimeout, uri]);

  const hideLoader = () => {
    console.log('🔄 Hiding WebView loader');
    setIsLoading(false);
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
  };

  const handleLoadStart = () => {
    console.log('🌐 WebView load started');
    setIsLoading(true);
    
    // Set a timeout to hide loader after 8 seconds as fallback
    const timeout = setTimeout(() => {
      console.log('⏰ WebView load timeout - hiding loader');
      hideLoader();
    }, 8000);
    
    setLoadTimeout(timeout);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    console.log('✅ WebView load ended');
    hideLoader();
    onLoadEnd?.();
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    console.log('🔄 WebView navigation state changed:', navState.url);
    
    // Hide loader when navigation completes
    if (navState.loading === false) {
      hideLoader();
    }
    
    // Hide loader for specific Setu URLs that indicate the page is ready
    if (navState.url.includes('otp') || navState.url.includes('verify') || navState.url.includes('success')) {
      console.log('🎯 Setu OTP/verification page detected - hiding loader');
      hideLoader();
    }
    
    onNavigationStateChange?.(navState);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={onMessage}
        onError={onError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        onShouldStartLoadWithRequest={(request) => {
          console.log('🔗 WebView should start load:', request.url);
          return true;
        }}
        onContentProcessDidTerminate={() => {
          console.log('⚠️ WebView content process terminated');
          hideLoader();
        }}
      />
      {isLoading && (
        <TouchableOpacity 
          style={styles.loadingOverlay} 
          onPress={hideLoader}
          activeOpacity={0.8}
        >
          <ActivityIndicator size="large" color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}; 