import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ConsentCallbackScreenStyles } from './ConsentCallbackScreen.styles';

export const ConsentCallbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const consents = useSelector((state: RootState) => state.consent.consents);

  useEffect(() => {
    // Get consent ID from route params
    const consentId = route.params?.consentId;
    const status = route.params?.status;
    const error = route.params?.error;

    if (consentId) {
      // Find the consent in the store
      const consent = consents.find(c => c.consentId === consentId);
      
      if (consent) {
        // Navigate based on status
        setTimeout(() => {
          if (status === 'ACTIVE') {
            navigation.navigate('Accounts' as never);
          } else if (status === 'REJECTED' || error) {
            navigation.navigate('Consent' as never);
          } else {
            navigation.navigate('Home' as never);
          }
        }, 2000);
      }
    }
  }, [consents, navigation, route.params]);

  const getStatusMessage = () => {
    const status = route.params?.status;
    const error = route.params?.error;

    if (error) {
      return {
        title: 'Consent Failed',
        message: 'There was an error processing your consent. Please try again.',
        color: '#FF6B6B'
      };
    }

    switch (status) {
      case 'ACTIVE':
        return {
          title: 'Consent Approved!',
          message: 'Your consent has been approved. Redirecting to your accounts...',
          color: '#4CAF50'
        };
      case 'REJECTED':
        return {
          title: 'Consent Rejected',
          message: 'You have rejected the consent. Redirecting back...',
          color: '#FF9800'
        };
      default:
        return {
          title: 'Processing Consent',
          message: 'Please wait while we process your consent...',
          color: '#2196F3'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <View style={ConsentCallbackScreenStyles.container}>
      <View style={ConsentCallbackScreenStyles.content}>
        <ActivityIndicator size="large" color={statusInfo.color} />
        <Text style={[ConsentCallbackScreenStyles.title, { color: statusInfo.color }]}>
          {statusInfo.title}
        </Text>
        <Text style={ConsentCallbackScreenStyles.message}>
          {statusInfo.message}
        </Text>
      </View>
    </View>
  );
}; 