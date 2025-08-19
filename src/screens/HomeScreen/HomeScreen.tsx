import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setUser } from '../../store/slices/userSlice';
import { styles } from './HomeScreen.styles';
import { Button } from '../../components/common/Button/Button';
import { AccountCard } from '../../components/financial/AccountCard/AccountCard';
import { ConsentStatus } from '../../components/financial/ConsentStatus/ConsentStatus';
import { ConfigTest } from '../../components/common/ConfigTest';
import { useAccounts } from '../../hooks/useAccounts';
import { useConsent } from '../../hooks/useConsent';
import { apiClient } from '../../services/api/apiClient';


export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { accounts, loading: accountsLoading, refreshAccounts } = useAccounts();
  const { consents, loading: consentsLoading, refreshConsents } = useConsent();
  const [showConfigTest, setShowConfigTest] = useState(false);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingUserProfile(true);
        console.log('🔄 Fetching user profile from /api/auth/me...');
        
        const response = await apiClient.get('/auth/me');
        console.log('✅ User profile fetched successfully:', response);
        
        // Update user in Redux store with complete profile including consent details
        dispatch(setUser(response as any));
        
        console.log('✅ User profile updated in Redux store');
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        // Don't show alert for profile fetch errors as user might still be able to use the app
      } finally {
        setLoadingUserProfile(false);
      }
    };

    fetchUserProfile();
  }, [dispatch]);

  const handleRefresh = async () => {
    try {
      // Fetch user profile
      const response = await apiClient.get('/auth/me');
      dispatch(setUser(response as any));
      console.log('✅ User profile refreshed');
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
    }
    
    // Refresh other data
    refreshAccounts();
    refreshConsents();
  };

  const handleCreateConsent = () => {
    navigation.navigate('Consent' as never);
  };

  const handleViewAccounts = () => {
    navigation.navigate('Accounts' as never);
  };

  const handleViewTransactions = () => {
    navigation.navigate('Transactions' as never);
  };

  const handleConfigTestComplete = (success: boolean) => {
    if (success) {
      Alert.alert(
        '✅ Configuration Test Complete',
        'All tests passed! Your app is properly configured for production.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '❌ Configuration Test Failed',
        'Some tests failed. Please check your backend connection and configuration.',
        [{ text: 'OK' }]
      );
    }
    setShowConfigTest(false);
  };

  const handleShowConfigTest = () => {
    setShowConfigTest(true);
  };



  if (showConfigTest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuration Test</Text>
          <Button
            title="← Back to Dashboard"
            onPress={() => setShowConfigTest(false)}
            variant="outline"
            size="small"
          />
        </View>
        <ConfigTest />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={accountsLoading || consentsLoading || loadingUserProfile}
            onRefresh={handleRefresh}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Setu AA Dashboard</Text>
          <Text style={styles.subtitle}>Account Aggregator Framework</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Create Consent"
            onPress={handleCreateConsent}
            variant="primary"
            size="large"
          />
          <Button
            title="View Accounts"
            onPress={handleViewAccounts}
            variant="outline"
            size="large"
          />
          <Button
            title="View Transactions"
            onPress={handleViewTransactions}
            variant="outline"
            size="large"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Consents</Text>
          
          {/* Display user's current consent details */}
          {user?.consentDetails?.consentId && (
            <ConsentStatus
              consent={{
                consentId: user.consentDetails.consentId,
                status: user.consentDetails.consentStatus || 'PENDING',
                createdAt: user.consentDetails.consentCreatedAt,
                updatedAt: user.consentDetails.consentUpdatedAt,
                expiresAt: user.consentDetails.consentExpiresAt,
                fipName: 'Setu FIP',
                dataLife: 24,
                permissions: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
                fetchType: 'PERIODIC',
                frequency: { unit: 'MONTH', value: 1 }
              }}
              showDetails={false}
              onPress={() => navigation.navigate('Consent' as never)}
              isUserConsent={true}
            />
          )}

          {/* Display other consents from API */}
          {consents.length > 0 ? (
            consents.slice(0, 2).map((consent) => (
              <ConsentStatus
                key={consent.consentId}
                consent={consent}
                showDetails={false}
                onPress={() => navigation.navigate('Consent' as never)}
              />
            ))
          ) : !user?.consentDetails?.consentId && (
            <Text style={styles.emptyText}>No active consents</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          {accounts.length > 0 ? (
            accounts.slice(0, 3).map((account) => (
              <AccountCard
                key={account.accountId}
                account={account}
                onPress={() => navigation.navigate('Accounts' as never)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No connected accounts</Text>
          )}
        </View>



        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <Button
            title="🔧 Test Backend Configuration"
            onPress={handleShowConfigTest}
            variant="outline"
            size="medium"
          />
          <Text style={styles.configText}>
            Test your backend connection, Setu configuration, and webhook endpoints.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}; 