import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userAuthService } from '../../services/auth/userAuthService';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { styles } from './LoginScreen.styles';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // navigation.navigate('Main' as never);

    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Starting login process...');
      
      const response = await userAuthService.login({ email, password });
      
      console.log('✅ Login successful');
      navigation.navigate('Main' as never);
      Alert.alert(
        'Success', 
        `Welcome back, ${response.user.name}!`,
        [
          {
            text: 'Continue',
            onPress: () => {
              console.log('🚀 Navigating to main app...');
              navigation.navigate('Main' as never);
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      Alert.alert(
        'Login Failed', 
        error.response?.data?.error?.message || error.message || 'Failed to login',
        [{ text: 'Try Again' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    console.log('🔘 Create Account button clicked in LoginScreen');
    console.log('🧭 Navigating to Register screen...');
    navigation.navigate('Register' as never);
  };

  const handleSkipLogin = () => {
    Alert.alert(
      'Skip Login',
      'You can skip login for testing purposes. Some features may not work without authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            console.log('⏭️ Skipping login...');
            navigation.navigate('Main' as never);
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🔐 Setu AA Login</Text>
          <Text style={styles.subtitle}>
            Sign in to access Account Aggregator features
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? "Logging in..." : "Login"}
              onPress={handleLogin}
              disabled={isLoading}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              disabled={isLoading}
              variant="outline"
            />

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipLogin}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip Login (Testing)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>
              Authenticating...
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ About Authentication</Text>
          <Text style={styles.infoText}>
            This login system provides secure access to your Account Aggregator features. 
            Your credentials are securely stored and all API calls are authenticated.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
