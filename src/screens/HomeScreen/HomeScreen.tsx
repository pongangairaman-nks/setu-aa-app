import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './HomeScreen.styles';
import { Button } from '../../components/common/Button/Button';
import { AccountCard } from '../../components/financial/AccountCard/AccountCard';
import { ConsentStatus } from '../../components/financial/ConsentStatus/ConsentStatus';
import { ConfigTest } from '../../components/common/ConfigTest';
import { useAccounts } from '../../hooks/useAccounts';
import { useConsent } from '../../hooks/useConsent';
import { simpleTokenService } from '../../services/auth/simpleTokenService';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { accounts, loading: accountsLoading, refreshAccounts } = useAccounts();
  const { consents, loading: consentsLoading, refreshConsents } = useConsent();
  const [showConfigTest, setShowConfigTest] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [fetchingToken, setFetchingToken] = useState(false);

  const handleRefresh = () => {
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

  const handleFetchToken = async () => {
    try {
      setFetchingToken(true);
      console.log('🔐 Fetching Setu token...');
      
      const token = await simpleTokenService.fetchToken();
      const info = await simpleTokenService.getTokenInfo();
      setTokenInfo(info);
      
      Alert.alert('Success', 'Token fetched successfully!');
      console.log('✅ Token fetched:', token);
      
    } catch (error) {
      console.error('❌ Token fetch failed:', error);
      Alert.alert('Error', `Failed to fetch token: ${error.message}`);
    } finally {
      setFetchingToken(false);
    }
  };

  const handleClearToken = async () => {
    try {
      await simpleTokenService.clearToken();
      setTokenInfo(null);
      Alert.alert('Success', 'Token cleared successfully!');
      console.log('✅ Token cleared');
    } catch (error) {
      console.error('❌ Clear token failed:', error);
      Alert.alert('Error', 'Failed to clear token');
    }
  };

  // Check token status on component mount
  React.useEffect(() => {
    const checkTokenStatus = async () => {
      try {
        const info = await simpleTokenService.getTokenInfo();
        setTokenInfo(info);
      } catch (error) {
        console.error('Error checking token status:', error);
      }
    };
    
    checkTokenStatus();
  }, []);

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
        <ConfigTest onComplete={handleConfigTestComplete} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={accountsLoading || consentsLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Setu AA Dashboard</Text>
          <Text style={styles.subtitle}>Account Aggregator Framework</Text>
          {tokenInfo && (
            <View style={styles.tokenStatus}>
              <Text style={styles.tokenStatusText}>
                🔑 Token: {tokenInfo.isValid ? 'Valid' : 'Expired'} 
                {tokenInfo.timeUntilExpiry && ` (${Math.floor(tokenInfo.timeUntilExpiry / 60)}m left)`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title={fetchingToken ? "Fetching Token..." : "🔐 Fetch Token"}
            onPress={handleFetchToken}
            disabled={fetchingToken}
            variant="primary"
            size="large"
          />
          <Button
            title="Create Consent"
            onPress={handleCreateConsent}
            variant="outline"
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
          {consents.length > 0 ? (
            consents.slice(0, 2).map((consent) => (
              <ConsentStatus
                key={consent.consentId}
                consent={consent}
                showDetails={false}
                onPress={() => navigation.navigate('Consent' as never, { consentId: consent.consentId } as never)}
              />
            ))
          ) : (
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
          <Text style={styles.sectionTitle}>Token Management</Text>
          <Button
            title="🗑️ Clear Token"
            onPress={handleClearToken}
            variant="outline"
            size="medium"
          />
          <Text style={styles.configText}>
            Clear the stored authentication token.
          </Text>
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