import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userAuthService } from '../../services/auth/userAuthService';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { styles } from './RegisterScreen.styles';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    console.log('🔍 Validating form...');
    
    if (!formData.name.trim()) {
      console.log('❌ Name validation failed');
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!formData.email.trim()) {
      console.log('❌ Email validation failed');
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log('❌ Email validation failed');
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      console.log('❌ Password validation failed');
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (formData.password.length < 6) {
      console.log('❌ Password length validation failed');
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Password match validation failed');
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    console.log('🔘 Register button clicked!');
    console.log('📋 Form data:', formData);
    
    // Simple test - just show an alert to confirm button is working
    Alert.alert('Test', 'Button is working! Form data: ' + JSON.stringify(formData));
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    try {
      setIsRegistering(true);
      console.log('👤 Starting registration process...');
      
      const user = await userAuthService.register({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
      });
      
      console.log('✅ Registration successful');
      
      Alert.alert(
        'Success', 
        `Account created for ${user.name}! Please login with your credentials.`,
        [
          {
            text: 'Login Now',
            onPress: () => navigation.goBack(),
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      Alert.alert(
        'Registration Failed', 
        error.response?.data?.error?.message || error.message || 'Failed to register',
        [{ text: 'Try Again' }]
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>📝 Create Account</Text>
          <Text style={styles.subtitle}>Join Setu AA to access Account Aggregator features</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isRegistering}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isRegistering}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password (min 6 characters)"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              editable={!isRegistering}
            />
            <Text style={styles.helperText}>Password must be at least 6 characters long</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              editable={!isRegistering}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isRegistering ? "Creating Account..." : "Create Account"}
              onPress={handleRegister}
              disabled={isRegistering}
            />
            <Button
              title="Back to Login"
              onPress={handleBackToLogin}
              variant="outline"
              disabled={isRegistering}
            />
          </View>
        </View>

        {isRegistering && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Creating your account...</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ About Your Account</Text>
          <Text style={styles.infoText}>
            • Your account is secured with industry-standard encryption{'\n'}
            • We use your email for login and important notifications{'\n'}
            • Your personal data is protected and never shared{'\n'}
            • You can access Account Aggregator features after login
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
