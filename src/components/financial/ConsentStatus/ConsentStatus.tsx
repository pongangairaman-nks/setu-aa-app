import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './ConsentStatus.styles';
import { Consent } from '../../../types/consent';

interface ConsentStatusProps {
  consent: Consent;
  onPress?: () => void;
  showDetails?: boolean;
}

export const ConsentStatus: React.FC<ConsentStatusProps> = ({
  consent,
  onPress,
  showDetails = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#28A745';
      case 'EXPIRED':
        return '#DC3545';
      case 'PENDING':
        return '#FFC107';
      case 'REVOKED':
        return '#6C757D';
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'EXPIRED':
        return 'Expired';
      case 'PENDING':
        return 'Pending';
      case 'REVOKED':
        return 'Revoked';
      default:
        return status;
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.consentId}>Consent ID: {consent.consentId}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(consent.status) }]} />
          <Text style={styles.statusText}>{getStatusText(consent.status)}</Text>
        </View>
      </View>

      {showDetails && (
        <>
          <View style={styles.details}>
            <Text style={styles.label}>FIP:</Text>
            <Text style={styles.value}>{consent.fipName}</Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.label}>Data Life:</Text>
            <Text style={styles.value}>{consent.dataLife} days</Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{new Date(consent.createdAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.label}>Expires:</Text>
            <Text style={styles.value}>{new Date(consent.expiresAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.permissions}>
            <Text style={styles.permissionsLabel}>Permissions:</Text>
            {consent.permissions.map((permission, index) => (
              <Text key={index} style={styles.permissionItem}>
                • {permission}
              </Text>
            ))}
          </View>
        </>
      )}
    </CardComponent>
  );
}; 