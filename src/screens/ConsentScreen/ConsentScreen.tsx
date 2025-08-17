import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList } from '../../types/navigation';
import { styles } from './ConsentScreen.styles';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { ConsentStatus } from '../../components/financial/ConsentStatus/ConsentStatus';
import { useConsent } from '../../hooks/useConsent';
import { useWebView } from '../../hooks/useWebView';
import { setuApi } from '../../services/api/setuApi';
import { simpleTokenService } from '../../services/auth/simpleTokenService';
import { SandboxConsentRequest } from '../../types/api';
import { ENV } from '../../config/environment';

type NavigationProp = NativeStackNavigationProp<TabParamList>;

export const ConsentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { consents, loading, refreshConsents, revokeConsent } = useConsent();
  const { openWebView } = useWebView();
  const [creatingConsent, setCreatingConsent] = useState(false);

  const handleCreateConsent = async () => {
    try {
      console.log('🚀 Starting consent creation process...');
      setCreatingConsent(true);
      
      // Check if we have a valid token
      console.log('🔍 Checking token validity...');
      const isTokenValid = await simpleTokenService.isTokenValid();
      console.log('Token valid:', isTokenValid);
      
      if (!isTokenValid) {
        Alert.alert(
          'Token Required',
          'Please fetch a token first using the "Fetch Token" button on the home screen.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('✅ Token is valid, creating consent...');
      
      // Get token info for debugging
      const tokenInfo = await simpleTokenService.getTokenInfo();
      console.log('Token info:', tokenInfo);
      
      // Show token info for debugging (optional - can be removed)
      if (ENV.IS_DEVELOPMENT) {
        Alert.alert(
          'Token Info',
          `Token Valid: ${isTokenValid}\nExpires: ${tokenInfo?.expiresAt || 'Unknown'}\nTime Left: ${tokenInfo?.timeUntilExpiry ? Math.floor(tokenInfo.timeUntilExpiry / 60) : 'Unknown'} minutes`,
          [{ text: 'Continue', onPress: () => {} }]
        );
      }
      
      // Create consent request with redirect URL - Updated to match working curl format
      const consentData: SandboxConsentRequest = {
        consentDuration: {
          unit: 'MONTH',
          value: '24'
        },
        vua: '9999999999@onemoney', // Using the VUA from your working curl
        dataRange: {
          from: '2023-01-01T00:00:00Z',
          to: '2025-01-24T00:00:00Z'
        },
        consentTypes: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
        context: []
      };
      
      console.log('📋 Consent request data:', consentData);
      
      console.log('🔐 Calling setuApi.createConsentRequest...');
      const consentRequest = await setuApi.createConsentRequest(consentData);
      console.log('✅ Consent request created:', consentRequest);
      console.log('🎯 Consent URL:', consentRequest.url);

      // Open WebView for consent flow
      console.log('🌐 Opening WebView with URL:', consentRequest.url);
      openWebView({
        uri: consentRequest.url,
        onSuccess: (data) => {
          console.log('Consent created successfully:', data);
          refreshConsents();
          navigation.goBack();
        },
        onError: (error) => {
          console.error('Consent creation failed:', error);
          Alert.alert('Error', 'Failed to create consent. Please try again.');
        },
      });
    } catch (error: any) {
      console.error('❌ Error creating consent:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      let errorMessage = 'Failed to create consent. Please try again.';
      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setCreatingConsent(false);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    Alert.alert(
      'Revoke Consent',
      'Are you sure you want to revoke this consent? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeConsent(consentId);
              Alert.alert('Success', 'Consent revoked successfully.');
            } catch (error) {
              console.error('Error revoking consent:', error);
              Alert.alert('Error', 'Failed to revoke consent. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading consents..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consent Management</Text>
        <Text style={styles.subtitle}>Manage your data sharing permissions</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.actions}>
          <Button
            title="Create New Consent"
            onPress={handleCreateConsent}
            variant="primary"
            size="large"
            loading={creatingConsent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Consents</Text>
          {consents.length > 0 ? (
            consents.map((consent) => (
              <ConsentStatus
                key={consent.consentId}
                consent={consent}
                onPress={() => {
                  if (consent.status === 'ACTIVE') {
                    navigation.navigate('Accounts', { consentId: consent.consentId });
                  }
                }}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No consents found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}; 