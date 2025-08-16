import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ConsentCallbackScreenStyles } from './ConsentCallbackScreen.styles';
import { Button } from '../../components/common/Button/Button';

export const ConsentCallbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const consents = useSelector((state: RootState) => state.consent.consents);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Get consent ID from route params or deep link
    const consentId = route.params?.consentId;
    const status = route.params?.status;
    const error = route.params?.error;
    const errorMessage = route.params?.errorMessage;

    console.log('📱 ConsentCallbackScreen - Received params:', { consentId, status, error, errorMessage });

    if (consentId) {
      // Find the consent in the store
      const consent = consents.find(c => c.consentId === consentId);
      
      console.log('📱 Found consent in store:', consent);
      
      if (consent) {
        // Process the consent status
        setTimeout(() => {
          setIsProcessing(false);
          
          if (consent.status === 'ACTIVE') {
            // Consent approved - show success and navigate to accounts
            setTimeout(() => {
              navigation.navigate('Accounts' as never);
            }, 2000);
          } else if (consent.status === 'REJECTED' || consent.error) {
            // Consent rejected or error - show error and navigate back
            setTimeout(() => {
              navigation.navigate('Consent' as never);
            }, 3000);
          } else {
            // Unknown status - navigate to home
            setTimeout(() => {
              navigation.navigate('Home' as never);
            }, 2000);
          }
        }, 1500);
      } else {
        // Consent not found in store
        console.warn('⚠️ Consent not found in store:', consentId);
        setIsProcessing(false);
        setTimeout(() => {
          navigation.navigate('Home' as never);
        }, 2000);
      }
    } else {
      // No consent ID provided
      console.warn('⚠️ No consent ID provided');
      setIsProcessing(false);
      setTimeout(() => {
        navigation.navigate('Home' as never);
      }, 2000);
    }
  }, [consents, navigation, route.params]);

  const getStatusMessage = () => {
    const consentId = route.params?.consentId;
    const consent = consents.find(c => c.consentId === consentId);
    
    if (!consent) {
      return {
        title: 'Consent Not Found',
        message: 'Unable to find the consent information. Please try again.',
        color: '#FF6B6B',
        icon: '❌'
      };
    }

    if (consent.error) {
      return {
        title: 'Consent Failed',
        message: consent.errorMessage || 'There was an error processing your consent. Please try again.',
        color: '#FF6B6B',
        icon: '❌'
      };
    }

    switch (consent.status) {
      case 'ACTIVE':
        return {
          title: 'Consent Approved! 🎉',
          message: 'Your consent has been successfully approved. Redirecting to your accounts...',
          color: '#4CAF50',
          icon: '✅'
        };
      case 'REJECTED':
        return {
          title: 'Consent Rejected',
          message: 'You have rejected the consent. Redirecting back to consent creation...',
          color: '#FF9800',
          icon: '⚠️'
        };
      case 'PENDING':
        return {
          title: 'Processing Consent',
          message: 'Please wait while we process your consent...',
          color: '#2196F3',
          icon: '⏳'
        };
      default:
        return {
          title: 'Unknown Status',
          message: 'Received an unknown consent status. Redirecting to home...',
          color: '#9E9E9E',
          icon: '❓'
        };
    }
  };

  const handleManualNavigation = (destination: string) => {
    switch (destination) {
      case 'home':
        navigation.navigate('Home' as never);
        break;
      case 'consent':
        navigation.navigate('Consent' as never);
        break;
      case 'accounts':
        navigation.navigate('Accounts' as never);
        break;
      default:
        navigation.navigate('Home' as never);
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <View style={ConsentCallbackScreenStyles.container}>
      <View style={ConsentCallbackScreenStyles.content}>
        {isProcessing ? (
          <ActivityIndicator size="large" color={statusInfo.color} />
        ) : (
          <Text style={[ConsentCallbackScreenStyles.icon, { color: statusInfo.color }]}>
            {statusInfo.icon}
          </Text>
        )}
        
        <Text style={[ConsentCallbackScreenStyles.title, { color: statusInfo.color }]}>
          {statusInfo.title}
        </Text>
        
        <Text style={ConsentCallbackScreenStyles.message}>
          {statusInfo.message}
        </Text>

        {!isProcessing && (
          <View style={ConsentCallbackScreenStyles.actions}>
            <Button
              title="Go to Home"
              onPress={() => handleManualNavigation('home')}
              variant="outline"
              size="medium"
              style={ConsentCallbackScreenStyles.button}
            />
            
            {statusInfo.title.includes('Approved') && (
              <Button
                title="View Accounts"
                onPress={() => handleManualNavigation('accounts')}
                variant="primary"
                size="medium"
                style={ConsentCallbackScreenStyles.button}
              />
            )}
            
            {statusInfo.title.includes('Rejected') || statusInfo.title.includes('Failed') && (
              <Button
                title="Try Again"
                onPress={() => handleManualNavigation('consent')}
                variant="primary"
                size="medium"
                style={ConsentCallbackScreenStyles.button}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}; 