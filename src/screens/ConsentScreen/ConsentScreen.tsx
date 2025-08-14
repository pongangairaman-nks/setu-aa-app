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

type NavigationProp = NativeStackNavigationProp<TabParamList>;

export const ConsentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { consents, loading, refreshConsents, revokeConsent } = useConsent();
  const { openWebView } = useWebView();
  const [creatingConsent, setCreatingConsent] = useState(false);

  const handleCreateConsent = async () => {
    try {
      setCreatingConsent(true);
      
      // Create consent request with redirect URL
      const consentRequest = await setuApi.createConsentRequest({
        fipId: 'test-fip', // Using test FIP for UAT environment
        dataLife: 30,
        permissions: ['ACCOUNT', 'TRANSACTIONS'],
        fetchType: 'PERIODIC',
        frequency: {
          unit: 'MONTH',
          value: 1,
        },
        redirectUrl: 'setu-aa-app://consent-callback',
      });

      // Open WebView for consent flow
      openWebView({
        uri: consentRequest.consentUrl,
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
    } catch (error) {
      console.error('Error creating consent:', error);
      Alert.alert('Error', 'Failed to create consent. Please try again.');
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