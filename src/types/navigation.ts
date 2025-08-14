import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>;
  WebView: {
    uri: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  };
  ConsentCallback: {
    consentId?: string;
    status?: string;
    error?: string;
  };
};

export type TabParamList = {
  Home: undefined;
  Consent: {
    consentId?: string;
  };
  Accounts: {
    consentId?: string;
  };
  Transactions: {
    accountId?: string;
  };
};

export type NavigationProps = {
  navigation: any;
  route: any;
}; 