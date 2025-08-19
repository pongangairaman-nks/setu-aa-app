import React, { useState, useEffect } from 'react';
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
import { useDataSession } from '../../hooks/useDataSession';
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
  const { createDataSession, loading: dataSessionLoading } = useDataSession();
  const [creatingConsent, setCreatingConsent] = useState(false);

  // Get user's consent details from Redux store
  const userConsentDetails = user?.consentDetails;
  const [consentDetails, setConsentDetails] = useState<any>(null);
  const [loadingConsentDetails, setLoadingConsentDetails] = useState(false);
  const [revokingConsent, setRevokingConsent] = useState(false);

  // Fetch consent details from Setu API when screen loads
  useEffect(() => {
    const fetchConsentDetails = async () => {
      if (userConsentDetails?.consentId) {
        try {
          setLoadingConsentDetails(true);
          console.log('🔍 Fetching consent details from Setu API:', userConsentDetails.consentId);
          
          const details = await setuApi.getConsentDetails(userConsentDetails.consentId);
          console.log('✅ Consent details fetched successfully:', details);
          
          setConsentDetails(details);
        } catch (error) {
          console.error('❌ Error fetching consent details:', error);
          // Don't show alert as user can still see basic consent info
        } finally {
          setLoadingConsentDetails(false);
        }
      }
    };

    fetchConsentDetails();
  }, [userConsentDetails?.consentId]);

  const handleRevokeConsent = async () => {
    if (!userConsentDetails?.consentId) {
      Alert.alert('Error', 'No consent ID found');
      return;
    }

    Alert.alert(
      'Revoke Consent',
      'Are you sure you want to revoke this consent? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              setRevokingConsent(true);
              console.log('🗑️ Revoking consent:', userConsentDetails.consentId);
              
              const result = await setuApi.revokeConsentRequest(userConsentDetails.consentId);
              console.log('✅ Consent revoked successfully:', result);
              
              // Update local state
              setConsentDetails(prev => prev ? { ...prev, status: 'REVOKED' } : null);
              
              // Update user consent details in Redux
              dispatch(updateConsentDetails({
                consentId: userConsentDetails.consentId,
                consentStatus: 'REVOKED',
                consentUpdatedAt: new Date().toISOString()
              }));
              
              Alert.alert(
                '✅ Consent Revoked',
                'Your consent has been successfully revoked. You will need to create a new consent to access financial data.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('❌ Error revoking consent:', error);
              Alert.alert(
                '❌ Revoke Failed',
                'Failed to revoke consent. Please try again later.',
                [{ text: 'OK' }]
              );
            } finally {
              setRevokingConsent(false);
            }
          },
        },
      ]
    );
  };

  const handleFetchData = async () => {
    if (!userConsentDetails?.consentId) {
      Alert.alert('Error', 'No consent ID found');
      return;
    }

    try {
      console.log('📊 Creating data session for consent:', userConsentDetails.consentId);
      
      // Create data range (last 6 months)
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 6);
      
      const dataRange = {
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      };
      
      const session = await createDataSession(userConsentDetails.consentId, dataRange, 'json');
      
      if (session) {
        Alert.alert(
          '✅ Data Session Created',
          `Data session created successfully with ID: ${session.id}\nStatus: ${session.status}\n\nSetu will notify when data is ready to fetch.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error creating data session:', error);
      Alert.alert(
        '❌ Data Session Creation Failed',
        'Failed to create data session. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

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

  // const handleRevokeConsent = async (consentId: string) => {
  //   Alert.alert(
  //     'Revoke Consent',
  //     'Are you sure you want to revoke this consent? This action cannot be undone.',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Revoke',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             await revokeConsent(consentId);
  //             Alert.alert('Success', 'Consent revoked successfully.');
  //           } catch (error) {
  //             console.error('Error revoking consent:', error);
  //             Alert.alert('Error', 'Failed to revoke consent. Please try again.');
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

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
          
          {/* Display user's consent details from Setu API */}
          {userConsentDetails && userConsentDetails.consentId && (
            <View style={styles.userConsentSection}>
              <Text style={styles.userConsentTitle}>Current Consent</Text>
              {loadingConsentDetails ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading consent details...</Text>
                </View>
              ) : consentDetails ? (
                <ConsentStatus
                  consent={{
                    consentId: consentDetails.id || userConsentDetails.consentId,
                    status: consentDetails.status || userConsentDetails.consentStatus || 'PENDING',
                    createdAt: consentDetails.detail?.consentStart || userConsentDetails.consentCreatedAt,
                    updatedAt: userConsentDetails.consentUpdatedAt,
                    expiresAt: consentDetails.detail?.consentExpiry || userConsentDetails.consentExpiresAt,
                    fipName: 'Setu FIP',
                    dataLife: consentDetails.detail?.dataLife?.value || 24,
                    permissions: consentDetails.detail?.consentTypes || ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
                    fetchType: consentDetails.detail?.fetchType || 'PERIODIC',
                    frequency: consentDetails.detail?.frequency || { unit: 'MONTH', value: 1 }
                  }}
                  onPress={() => {
                    if (consentDetails.status === 'ACTIVE' || userConsentDetails.consentStatus === 'APPROVED') {
                      navigation.navigate('Accounts', { consentId: userConsentDetails.consentId });
                    }
                  }}
                  isUserConsent={true}
                  onRevoke={handleRevokeConsent}
                  showRevokeButton={true}
                  onFetchData={handleFetchData}
                  showFetchDataButton={true}
                />
              ) : (
                <ConsentStatus
                  consent={{
                    consentId: userConsentDetails.consentId,
                    status: userConsentDetails.consentStatus || 'PENDING',
                    createdAt: userConsentDetails.consentCreatedAt,
                    updatedAt: userConsentDetails.consentUpdatedAt,
                    expiresAt: userConsentDetails.consentExpiresAt,
                    fipName: 'Setu FIP',
                    dataLife: 24,
                    permissions: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
                    fetchType: 'PERIODIC',
                    frequency: { unit: 'MONTH', value: 1 }
                  }}
                  onPress={() => {
                    if (userConsentDetails.consentStatus === 'APPROVED') {
                      navigation.navigate('Accounts', { consentId: userConsentDetails.consentId });
                    }
                  }}
                  isUserConsent={true}
                  onRevoke={handleRevokeConsent}
                  showRevokeButton={true}
                  onFetchData={handleFetchData}
                  showFetchDataButton={true}
                />
              )}
            </View>
          )}

          {/* Display other consents from API */}
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
          ) : !userConsentDetails?.consentId && (
            <Text style={styles.emptyText}>No consents found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}; 