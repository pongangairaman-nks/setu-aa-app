import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './AccountsScreen.styles';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { AccountCard } from '../../components/financial/AccountCard/AccountCard';
import { useAccounts } from '../../hooks/useAccounts';
import { setuApi } from '../../services/api/setuApi';

export const AccountsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accounts, loading, refreshAccounts, fetchAccounts } = useAccounts();
  const [fetchingAccounts, setFetchingAccounts] = useState(false);

  const handleFetchAccounts = async () => {
    try {
      setFetchingAccounts(true);
      
      // Get active consent ID from route params or use the first active consent
      const consentId = route.params?.consentId;
      
      if (!consentId) {
        Alert.alert('Error', 'No active consent found. Please create a consent first.');
        return;
      }

      await fetchAccounts(consentId);
      Alert.alert('Success', 'Accounts fetched successfully!');
    } catch (error) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Error', 'Failed to fetch accounts. Please try again.');
    } finally {
      setFetchingAccounts(false);
    }
  };

  const handleViewTransactions = (accountId: string) => {
    navigation.navigate('Transactions' as never, { accountId } as never);
  };

  const handleRefresh = () => {
    refreshAccounts();
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading accounts..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connected Accounts</Text>
        <Text style={styles.subtitle}>
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.actions}>
          <Button
            title="Fetch Latest Accounts"
            onPress={handleFetchAccounts}
            variant="primary"
            size="large"
            loading={fetchingAccounts}
          />
        </View>

        <View style={styles.section}>
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <AccountCard
                key={account.accountId}
                account={account}
                onPress={() => handleViewTransactions(account.accountId)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No accounts found</Text>
              <Text style={styles.emptySubtext}>
                Create a consent and fetch accounts to get started
              </Text>
              <Button
                title="Create Consent"
                onPress={() => navigation.navigate('Consent' as never)}
                variant="outline"
                size="medium"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}; 