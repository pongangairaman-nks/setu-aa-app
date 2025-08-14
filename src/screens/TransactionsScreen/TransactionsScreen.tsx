import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './TransactionsScreen.styles';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { TransactionItem } from '../../components/financial/TransactionItem/TransactionItem';
import { useTransactions } from '../../hooks/useTransactions';
import { setuApi } from '../../services/api/setuApi';

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactions, loading, refreshTransactions, fetchTransactions } = useTransactions();
  const [fetchingTransactions, setFetchingTransactions] = useState(false);

  const accountId = route.params?.accountId;
  const consentId = route.params?.consentId;

  const handleFetchTransactions = async () => {
    try {
      setFetchingTransactions(true);
      
      if (!accountId) {
        Alert.alert('Error', 'No account selected. Please select an account first.');
        return;
      }

      if (!consentId) {
        Alert.alert('Error', 'No consent ID found. Please create a consent first.');
        return;
      }

      await fetchTransactions(accountId, consentId);
      Alert.alert('Success', 'Transactions fetched successfully!');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions. Please try again.');
    } finally {
      setFetchingTransactions(false);
    }
  };

  const handleRefresh = () => {
    refreshTransactions();
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading transactions..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
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
            title="Fetch Latest Transactions"
            onPress={handleFetchTransactions}
            variant="primary"
            size="large"
            loading={fetchingTransactions}
          />
        </View>

        <View style={styles.section}>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.transactionId}
                transaction={transaction}
                showAccount={!accountId}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions found</Text>
              <Text style={styles.emptySubtext}>
                Fetch transactions to view your transaction history
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}; 