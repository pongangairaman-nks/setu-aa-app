import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { apiClient } from '../../services/api/apiClient';
import { ENV } from '../../config/environment';
import { Button } from './Button';

interface ConfigTestProps {
  onComplete?: (success: boolean) => void;
}

export const ConfigTest: React.FC<ConfigTestProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    backend: boolean;
    setu: boolean;
    webhook: boolean;
  }>({
    backend: false,
    setu: false,
    webhook: false,
  });

  const testBackendConnection = async () => {
    try {
      setIsLoading(true);
      const isHealthy = await apiClient.healthCheck();
      setTestResults(prev => ({ ...prev, backend: isHealthy }));
      
      if (isHealthy) {
        Alert.alert('✅ Success', 'Backend connection is working!');
      } else {
        Alert.alert('❌ Error', 'Backend connection failed');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, backend: false }));
      Alert.alert('❌ Error', 'Backend connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testSetuConfiguration = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/test-setu');
      const isConfigured = response.success;
      setTestResults(prev => ({ ...prev, setu: isConfigured }));
      
      if (isConfigured) {
        Alert.alert('✅ Success', 'Setu configuration is working!');
      } else {
        Alert.alert('❌ Error', 'Setu configuration failed');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, setu: false }));
      Alert.alert('❌ Error', 'Setu configuration test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhookEndpoint = async () => {
    try {
      setIsLoading(true);
      const testPayload = {
        type: 'CONSENT_STATUS_UPDATE',
        consentId: 'test-config-check',
        success: true,
        data: { status: 'ACTIVE' },
        timestamp: new Date().toISOString(),
      };
      
      const response = await apiClient.post('/webhooks/setu', testPayload);
      const isWorking = response.success;
      setTestResults(prev => ({ ...prev, webhook: isWorking }));
      
      if (isWorking) {
        Alert.alert('✅ Success', 'Webhook endpoint is working!');
      } else {
        Alert.alert('❌ Error', 'Webhook endpoint failed');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, webhook: false }));
      Alert.alert('❌ Error', 'Webhook endpoint test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    await testBackendConnection();
    await testSetuConfiguration();
    await testWebhookEndpoint();
    
    const allPassed = Object.values(testResults).every(result => result);
    onComplete?.(allPassed);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuration Test</Text>
      
      <View style={styles.configInfo}>
        <Text style={styles.label}>Backend URL:</Text>
        <Text style={styles.value}>{ENV.API_BASE_URL}</Text>
        
        <Text style={styles.label}>Environment:</Text>
        <Text style={styles.value}>{ENV.NODE_ENV}</Text>
        
        <Text style={styles.label}>App Version:</Text>
        <Text style={styles.value}>{ENV.VERSION}</Text>
      </View>

      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>Connection Tests</Text>
        
        <View style={styles.testItem}>
          <Text style={[styles.testStatus, testResults.backend ? styles.success : styles.error]}>
            {testResults.backend ? '✅' : '❌'} Backend Connection
          </Text>
          <Button 
            title="Test Backend" 
            onPress={testBackendConnection}
            disabled={isLoading}
            style={styles.testButton}
          />
        </View>

        <View style={styles.testItem}>
          <Text style={[styles.testStatus, testResults.setu ? styles.success : styles.error]}>
            {testResults.setu ? '✅' : '❌'} Setu Configuration
          </Text>
          <Button 
            title="Test Setu" 
            onPress={testSetuConfiguration}
            disabled={isLoading}
            style={styles.testButton}
          />
        </View>

        <View style={styles.testItem}>
          <Text style={[styles.testStatus, testResults.webhook ? styles.success : styles.error]}>
            {testResults.webhook ? '✅' : '❌'} Webhook Endpoint
          </Text>
          <Button 
            title="Test Webhook" 
            onPress={testWebhookEndpoint}
            disabled={isLoading}
            style={styles.testButton}
          />
        </View>

        <Button 
          title="Run All Tests" 
          onPress={runAllTests}
          disabled={isLoading}
          style={styles.runAllButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  configInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  testSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  testStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
  testButton: {
    minWidth: 100,
  },
  runAllButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
  },
});
