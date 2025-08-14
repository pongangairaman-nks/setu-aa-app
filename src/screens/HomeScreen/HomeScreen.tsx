import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './HomeScreen.styles';
import { Button } from '../../components/common/Button/Button';
import { AccountCard } from '../../components/financial/AccountCard/AccountCard';
import { ConsentStatus } from '../../components/financial/ConsentStatus/ConsentStatus';
import { useAccounts } from '../../hooks/useAccounts';
import { useConsent } from '../../hooks/useConsent';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { accounts, loading: accountsLoading, refreshAccounts } = useAccounts();
  const { consents, loading: consentsLoading, refreshConsents } = useConsent();

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
      </ScrollView>
    </SafeAreaView>
  );
}; 