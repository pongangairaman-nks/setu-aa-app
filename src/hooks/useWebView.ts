import { useNavigation } from '@react-navigation/native';

interface WebViewParams {
  uri: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useWebView = () => {
  const navigation = useNavigation();

  const openWebView = (params: WebViewParams) => {
    navigation.navigate('WebView' as never, params as never);
  };

  const openConsentFlow = (consentUrl: string, onSuccess?: (data: any) => void, onError?: (error: any) => void) => {
    openWebView({
      uri: consentUrl,
      onSuccess,
      onError,
    });
  };

  const openBankLogin = (loginUrl: string, onSuccess?: (data: any) => void, onError?: (error: any) => void) => {
    openWebView({
      uri: loginUrl,
      onSuccess,
      onError,
    });
  };

  return {
    openWebView,
    openConsentFlow,
    openBankLogin,
  };
}; 