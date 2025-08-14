import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './AccountCard.styles';
import { Account } from '../../../types/account';

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
  showBalance?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onPress,
  showBalance = true,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.accountName}>{account.accountName}</Text>
        <Text style={styles.accountNumber}>{account.accountNumber}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.bankName}>{account.bankName}</Text>
        <Text style={styles.accountType}>{account.accountType}</Text>
      </View>

      {showBalance && (
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{account.balance?.toLocaleString() || '0'}
          </Text>
        </View>
      )}

      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: account.status === 'ACTIVE' ? '#28A745' : '#DC3545' }]} />
        <Text style={styles.statusText}>{account.status}</Text>
      </View>
    </CardComponent>
  );
}; 