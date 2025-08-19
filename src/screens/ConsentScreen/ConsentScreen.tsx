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
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateConsentDetails } from '../../store/slices/userSlice';

import { SandboxConsentRequest } from '../../types/api';
import { ENV } from '../../config/environment';

type NavigationProp = NativeStackNavigationProp<TabParamList>;

export const ConsentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { consents, loading, refreshConsents, revokeConsent } = useConsent();
  const { openWebView } = useWebView();
  const [creatingConsent, setCreatingConsent] = useState(false);

  const handleCreateConsent = async () => {
    try {
      console.log('🚀 Starting consent creation process...');
      // setCreatingConsent(true);
      
      // Create consent request with redirect URL - Updated to match working curl format
      const consentData: SandboxConsentRequest = {
        consentDuration: {
          unit: 'MONTH',
          value: '24'
        },
        vua: '7530060544@onemoney', // Using the VUA from your working curl
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

      // Store consent details in user profile before opening WebView
      if (consentRequest.id && user) {
        console.log('📋 Storing consent details in user profile...');
        dispatch(updateConsentDetails({
          consentId: consentRequest.id,
          consentStatus: 'PENDING',
          consentCreatedAt: new Date().toISOString(),
          consentUpdatedAt: new Date().toISOString(),
          consentExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        }));
        console.log('✅ Consent details stored in user profile');
      }

      // Open WebView for consent flow
      console.log('🌐 Opening WebView with URL:', consentRequest.url);
      openWebView({
        uri: consentRequest.url,
        onSuccess: (data) => {
          console.log('✅ Consent created successfully:', data);
          
          // Check if we have a valid consent ID
          if (data && data.consentId) {
            console.log('📋 Consent ID received:', data.consentId);
            console.log('📊 Consent status:', data.status);
            
            // Refresh consents to get updated status
            refreshConsents();
            
            // Show success message
            Alert.alert(
              'Success! 🎉',
              `Consent created successfully!\n\nConsent ID: ${data.consentId}\nStatus: ${data.status || 'ACTIVE'}`,
              [
                {
                  text: 'View Accounts',
                  onPress: () => {
                    navigation.navigate('Accounts', { consentId: data.consentId });
                  }
                },
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          } else {
            console.warn('⚠️ No consent ID in success data:', data);
            Alert.alert('Warning', 'Consent created but no consent ID received. Please check your consents.');
            refreshConsents();
            navigation.goBack();
          }
        },
        onError: (error) => {
          console.error('❌ Consent creation failed:', error);
          
          let errorMessage = 'Failed to create consent. Please try again.';
          if (error && error.errorDescription) {
            errorMessage = error.errorDescription;
          } else if (error && error.error) {
            errorMessage = `Error: ${error.error}`;
          }
          
          Alert.alert('Error', errorMessage);
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