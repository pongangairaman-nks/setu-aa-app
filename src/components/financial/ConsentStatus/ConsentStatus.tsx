import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '../../common/Button/Button';
import { styles } from './ConsentStatus.styles';
import { Consent } from '../../../types/consent';

interface ConsentStatusProps {
  consent: Consent;
  onPress?: () => void;
  showDetails?: boolean;
  isUserConsent?: boolean;
  onRevoke?: () => void;
  showRevokeButton?: boolean;
  onFetchData?: () => void;
  showFetchDataButton?: boolean;
}

export const ConsentStatus: React.FC<ConsentStatusProps> = ({
  consent,
  onPress,
  showDetails = true,
  isUserConsent = false,
  onRevoke,
  showRevokeButton = false,
  onFetchData,
  showFetchDataButton = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return '#28A745';
      case 'EXPIRED':
        return '#DC3545';
      case 'PENDING':
        return '#FFC107';
      case 'REVOKED':
      case 'REJECTED':
        return '#6C757D';
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'APPROVED':
        return 'Approved';
      case 'EXPIRED':
        return 'Expired';
      case 'PENDING':
        return 'Pending';
      case 'REVOKED':
        return 'Revoked';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent 
      style={[
        styles.container, 
        isUserConsent && { borderColor: '#007AFF', borderWidth: 2 }
      ]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.consentId}>Consent ID: {consent.consentId}</Text>
          {isUserConsent && (
            <Text style={styles.userConsentBadge}>Current</Text>
          )}
        </View>
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
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {/* Fetch Data Button */}
        {showFetchDataButton && onFetchData && (consent.status === 'ACTIVE' || consent.status === 'APPROVED') && (
          <Button
            title="Fetch Data"
            onPress={onFetchData}
            variant="primary"
            size="small"
          />
        )}
        
        {/* Revoke Button */}
        {showRevokeButton && onRevoke && (consent.status === 'ACTIVE' || consent.status === 'APPROVED') && (
          <Button
            title="Revoke Consent"
            onPress={onRevoke}
            variant="danger"
            size="small"
          />
        )}
      </View>
    </CardComponent>
  );
}; 