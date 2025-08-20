import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './AccountsScreen.styles';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { AccountCard } from '../../components/financial/AccountCard/AccountCard';
import { useUserData } from '../../hooks/useUserData';
import { setuApi } from '../../services/api/setuApi';

export const AccountsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    accounts, 
    loading, 
    error, 
    fetchUserData, 
    refreshUserData, 
    hasAccounts,
    summary 
  } = useUserData();
  const [fetchingData, setFetchingData] = useState(false);

  const handleFetchData = async () => {
    try {
      setFetchingData(true);
      
      await fetchUserData();
      Alert.alert('Success', 'Financial data fetched successfully!');
    } catch (error) {
      console.error('Error fetching financial data:', error);
      Alert.alert('Error', 'Failed to fetch financial data. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  const handleViewTransactions = (linkRefNumber: string) => {
    (navigation as any).navigate('Transactions', { 
      linkRefNumber,
      accountId: linkRefNumber 
    });
  };

  const handleRefresh = () => {
    refreshUserData();
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
            title="Fetch Financial Data"
            onPress={handleFetchData}
            variant="primary"
            size="large"
            loading={fetchingData}
          />
        </View>

        <View style={styles.section}>
          {hasAccounts ? (
            accounts.map((account: any) => (
              <AccountCard
                key={account.linkRefNumber}
                account={{
                  accountId: account.linkRefNumber,
                  accountName: account.maskedAccNumber,
                  accountNumber: account.maskedAccNumber,
                  bankName: account.fiType || 'Bank',
                  accountType: account.accType,
                  balance: account.summary?.currentBalance || 0,
                  status: account.status,
                  lastUpdated: account.lastUpdated
                }}
                onPress={() => handleViewTransactions(account.linkRefNumber)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No accounts found</Text>
              <Text style={styles.emptySubtext}>
                Create a consent and fetch financial data to get started
              </Text>
              <Button
                title="Create Consent"
                onPress={() => (navigation as any).navigate('Consent')}
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