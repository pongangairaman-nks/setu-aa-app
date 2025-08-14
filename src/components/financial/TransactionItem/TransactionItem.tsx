import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './TransactionItem.styles';
import { Transaction } from '../../../types/transaction';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  showAccount?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  showAccount = false,
}) => {
  const isCredit = transaction.transactionType === 'CREDIT';
  const amountColor = isCredit ? '#28A745' : '#DC3545';
  const amountPrefix = isCredit ? '+' : '-';

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.date}>{formatDate(transaction.transactionDate)}</Text>
        {showAccount && (
          <Text style={styles.accountNumber}>{transaction.accountNumber}</Text>
        )}
      </View>

      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}₹{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.balance}>
          Balance: ₹{formatCurrency(transaction.balance)}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: transaction.status === 'SUCCESS' ? '#28A745' : '#FFC107' }]} />
          <Text style={styles.statusText}>{transaction.status}</Text>
        </View>
      </View>
    </View>
  );
}; 