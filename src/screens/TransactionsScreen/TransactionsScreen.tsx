import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './TransactionsScreen.styles';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { TransactionItem } from '../../components/financial/TransactionItem/TransactionItem';
import { useUserData } from '../../hooks/useUserData';
import { setuApi } from '../../services/api/setuApi';

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    transactions, 
    loading, 
    error, 
    fetchUserData, 
    refreshUserData, 
    getTransactionsByAccount,
    hasTransactions,
    summary 
  } = useUserData();
  const [fetchingData, setFetchingData] = useState(false);

  const accountId = route.params?.accountId;
  const linkRefNumber = route.params?.linkRefNumber;

  // Filter transactions by account if accountId is provided
  const filteredTransactions = accountId && linkRefNumber 
    ? getTransactionsByAccount(linkRefNumber)
    : transactions;

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

  const handleRefresh = () => {
    refreshUserData();
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
            title="Fetch Financial Data"
            onPress={handleFetchData}
            variant="primary"
            size="large"
            loading={fetchingData}
          />
        </View>

        <View style={styles.section}>
          {hasTransactions && filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction: any) => (
              <TransactionItem
                key={transaction.transactionId}
                transaction={{
                  transactionId: transaction.transactionId,
                  accountId: transaction.linkRefNumber,
                  accountNumber: transaction.linkRefNumber,
                  description: transaction.description,
                  amount: transaction.amount,
                  transactionType: transaction.type,
                  transactionDate: transaction.timestamp,
                  balance: transaction.currentBalance,
                  status: transaction.status,
                  category: transaction.mode,
                  merchantName: transaction.description,
                  referenceNumber: transaction.reference,
                  lastUpdated: transaction.lastUpdated
                }}
                showAccount={!accountId}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions found</Text>
              <Text style={styles.emptySubtext}>
                Fetch financial data to view your transaction history
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}; 