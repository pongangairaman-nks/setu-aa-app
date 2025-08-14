import React, { useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
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

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        style={styles.webview}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={onMessage}
        onError={onError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
}; 